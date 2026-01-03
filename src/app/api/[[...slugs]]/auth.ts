// import { Elysia } from "elysia";
// class AuthError extends Error {
//     constructor(message: string) {
//         super(message);
//         this.name = "AuthError";
//     }   
// }

// export const authMiddleware = new Elysia({ name: "auth" }).error({ AuthError }).onError(({ code, set }) => {
//     if (code === "AuthError"){
//         set.status = 401;
//         return { error: "Unauthorized" };
//     }
// }).derive({ as: "scoped" }, async ({ query, cookie }) => {
//     const roomId = query.roomId;
//     const token = cookie["x-auth-token"].value as string | undefined;
    
//     if (!roomId || !token) {
//         throw new AuthError("Missing roomId or token");
//     }


// })