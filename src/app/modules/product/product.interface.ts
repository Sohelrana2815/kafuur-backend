// fragrance.service.ts

import {
  Category,
  ScentProfile,
  ScentStrength,
  UsageOccasion,
} from "@prisma/client";

export interface QuizAnswers {
  usages: UsageOccasion[];
  scentProfiles: ScentProfile[];
  strength: ScentStrength;
  category?: Category;
  minPrice: number;
  maxPrice: number;
}
