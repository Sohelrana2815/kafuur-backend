/* eslint-disable @typescript-eslint/no-dynamic-delete */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/QueryBuilder.ts

export class QueryBuilder<TModel extends { findMany: any; count: any }> {
  public model: TModel;
  public query: Record<string, any>;
  public prismaQuery: any;

  constructor(model: TModel, query: Record<string, any>) {
    this.model = model;
    this.query = query;
    this.prismaQuery = {
      where: {},
    };
  }

  /**
   * Performs partial case-insensitive search across specified fields
   */
  search(searchableFields: string[]): this {
    const searchTerm = this.query.searchTerm || "";
    if (searchTerm) {
      this.prismaQuery.where = {
        ...this.prismaQuery.where,
        OR: searchableFields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: "insensitive", // Case-insensitive matching in PostgreSQL
          },
        })),
      };
    }
    return this;
  }

  /**
   * Filters out key query words and applies standard exact matching.
   * Also safely converts string "true"/"false" parameters to actual booleans.
   */
  filter(): this {
    const filterQuery = { ...this.query };
    const excludeFields = ["searchTerm", "sort", "limit", "page", "fields"];

    // Remove control terms from filtering rules
    excludeFields.forEach((field) => delete filterQuery[field]);

    // Format query parameters cleanly for Prisma constraints
    Object.keys(filterQuery).forEach((key) => {
      if (filterQuery[key] === "true") filterQuery[key] = true;
      if (filterQuery[key] === "false") filterQuery[key] = false;
    });

    this.prismaQuery.where = {
      ...this.prismaQuery.where,
      ...filterQuery,
    };

    return this;
  }

  /**
   * Parses comma-separated sorting conditions (e.g., sort=price,-createdAt)
   */
  sort(): this {
    const sortStr = this.query.sort;
    if (sortStr) {
      const sortConditions = sortStr.split(",").map((item: string) => {
        const isDesc = item.startsWith("-");
        const field = isDesc ? item.substring(1) : item;
        return { [field]: isDesc ? "desc" : "asc" };
      });
      this.prismaQuery.orderBy = sortConditions;
    } else {
      // Fallback default sort
      this.prismaQuery.orderBy = {
        createdAt: "desc",
      };
    }
    return this;
  }

  /**
   * Limits database response load selectively (e.g., fields=name,price)
   */
  fields(): this {
    const fieldsStr = this.query.fields;
    if (fieldsStr) {
      const selectFields: Record<string, boolean> = {};
      fieldsStr.split(",").forEach((field: string) => {
        const trimmed = field.trim();
        if (trimmed) {
          selectFields[trimmed] = true;
        }
      });
      this.prismaQuery.select = selectFields;
    }
    return this;
  }

  /**
   * Configures skipping limits for pagination metrics
   */
  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.prismaQuery.skip = skip;
    this.prismaQuery.take = limit;

    return this;
  }

  /**
   * Executes findMany with accumulated configurations
   */
  build() {
    return this.model.findMany(this.prismaQuery);
  }

  /**
   * Returns exact pagination metadata
   */
  async getMeta() {
    const totalDocuments = await this.model.count({
      where: this.prismaQuery.where,
    });

    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const totalPage = Math.ceil(totalDocuments / limit);

    return {
      page,
      limit,
      total: totalDocuments,
      totalPage,
    };
  }
}
