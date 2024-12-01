import { api, APIError } from "encore.dev/api";
import { AddUserMutationResponse, ResolversTypes, User } from "../graphql/__generated__/resolvers-types";
import prisma from "../config/database";

type AddUserRequest = Omit<Required<User>, "__typename" | "id" | "books">;
type CountResponse = { status: boolean, count: number }
type ListResponse = { users: User[] }
type SingleResponse = { user: User | null }
/**
 * Counts and returns the number of existing users
 */
export const count = api(
    { expose: true, method: "GET", path: "/count/users" },
    async (): Promise<CountResponse> => {
        try {
            const result = await UserService.count();
            return { status: true, count: result };
        } catch (error) {
            throw APIError.aborted(
                error?.toString() || "Error counting existing users",
            );
        }
    },
);

/**
 * Method to create a new user
 */
export const add = api(
    { expose: true, method: "POST", path: "/users" },
    async (data: AddUserRequest): Promise<SingleResponse> => {
        try {
            if (!data.name || !data.surname) {
                throw APIError.invalidArgument("Missing fields");
            }
            const result = await UserService.create(data);
            return { user: result };
        } catch (error) {
            throw APIError.aborted(error?.toString() || "Error creating the user");
        }
    },
);

/**
 * Get all users data
 */
export const list = api(
    { expose: true, method: "GET", path: "/users" },
    async (): Promise<ListResponse> => {
        try {
            const result = await UserService.find();
            return { users: result };
        } catch (error) {
            throw APIError.aborted(error?.toString() || "Error getting users data");
        }
    },
);

/**
 * Get user data by id
 */
export const readOne = api(
    { expose: true, method: "GET", path: "/users/:id" },
    async ({ id }: { id: number }): Promise<SingleResponse> => {
        try {
            const result = await UserService.findOne(id);
            return { user: result }
        } catch (error) {
            throw APIError.aborted(error?.toString() || "Error getting user data");
        }
    },
);

/**
 * Update user data
 */
export const update = api(
    { expose: true, method: "PATCH", path: "/users/:id" },
    async ({
        id,
        data,
    }: {
        id: number;
        data: Partial<AddUserRequest>;
    }): Promise<SingleResponse> => {
        try {
            const result = await UserService.update(id, data);
            return { user: result };
        } catch (error) {
            throw APIError.aborted(error?.toString() || "Error updating user");
        }
    },
);

/**
 * Delete user by id
 */
export const destroy = api(
    { expose: true, method: "DELETE", path: "/users/:id" },
    async ({ id }: { id: number }): Promise<SingleResponse> => {
        try {
            const result = await UserService.delete(id);
            return { user: result };
        } catch (error) {
            throw APIError.aborted(error?.toString() || "Error deleting user");
        }
    },
);

// Services ---------------------------------------------------------------------------------------------------


const UserService = {
    count: async (): Promise<number> => {
        const count = await prisma.user.count();
        return count;
    },


    create: async (data: AddUserRequest): Promise<User> => {
        const user = await prisma.user.create({ data: { ...data, books: { create: [] } } });
        return user
    },

    update: async (
        id: number,
        data: Partial<AddUserRequest>
    ): Promise<User | null> => {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return null
        }
        const updated = await prisma.user.update({
            where: { id },
            data: {
                name: data.name || user.name,
                surname: data.surname || user.surname,
            },
        });
        return updated
    },

    find: async (): Promise<User[]> => {
        let users: User[] = [];
        users = await prisma.user.findMany({ include: { books: true } });
        return users.map((user) => user as User);
    },

    findOne: async (id: number): Promise<User | null> => {
        const user = await prisma.user.findUnique({ where: { id }, include: { books: true } });
        return user ? (user as User) : null;
    },

    delete: async (id: number): Promise<User | null> => {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return null
        }
        await prisma.user.delete({ where: { id } });
        return user
    },
};
