npx prisma migrate dev --name init
 go for import replacing const {} = require(') in tsx# best_backend
1.findUnique 

In TypeScript, a string type cannot directly be assigned null unless you explicitly allow it by using a union type. For example:

export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    profilePic?: string | null; // Allows the field to be null
}

cookie-parser for reading cookies