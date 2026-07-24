import { Role } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload {

    id: string;
    email: string;
    role: Role

}
