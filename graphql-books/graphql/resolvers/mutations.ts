import { book as bookClient, user as userClient } from "~encore/clients";
import { MutationResolvers } from "../__generated__/resolvers-types";
import { APIError } from "encore.dev/api";

// Use the generated `MutationResolvers` type to type check our mutations
const mutations: MutationResolvers = {
    addBook: async (_, { title, authorId }) => {
        try {
            const { book } = await bookClient.add({ title, authorId });
            return {
                book: book,
                success: true,
                code: "ok",
                message: "New book added",
            };
        } catch (err) {
            const apiError = err as APIError;

            return {
                book: null,
                success: false,
                code: apiError.code,
                message: apiError.message,
            };
        }
    },
    deleteBook: async (_, { id }) => {
        try {
            const { book } = await bookClient.destroy({ id });
            return {
                book: book,
                success: true,
                code: "ok",
                message: "book deleted",
            };
        } catch (err) {
            const apiError = err as APIError;

            return {
                book: null,
                success: false,
                code: apiError.code,
                message: apiError.message,
            };
        }
    },
    addUser: async (_, { name, surname }) => {
        try {
            const { user } = await userClient.add({ name, surname });
            return {
                user: user,
                success: true,
                code: "ok",
                message: "New user added",
            };
        } catch (err) {
            const apiError = err as APIError;

            return {
                user: null,
                success: false,
                code: apiError.code,
                message: apiError.message,
            };
        }
    },
    deleteUser: async (_, { id }) => {
        try {
            const { user } = await userClient.destroy({ id });
            return {
                user: user,
                success: true,
                code: "ok",
                message: "user deleted",
            };
        } catch (err) {
            const apiError = err as APIError;
            return {
                user: null,
                success: false,
                code: apiError.code,
                message: apiError.message,
            };
        }
    },
};

export default mutations;
