import { api, APIError } from "encore.dev/api";
import { AddBookMutationResponse, Book, ResolversTypes } from "../graphql/__generated__/resolvers-types";
import prisma from "../config/database";

type AddBookRequest = Omit<Required<Book>, "__typename" | "id" | "author">;
type CountResponse = { status: boolean, count: number }
type ListResponse = { books: Book[] }
type SingleResponse = { book: Book | null }
/**
 * Counts and returns the number of existing books
 */
export const count = api(
    { expose: true, method: "GET", path: "/count/books" },
    async (): Promise<CountResponse> => {
        try {
            const result = await BookService.count();
            return { status: true, count: result };
        } catch (error) {
            throw APIError.aborted(
                error?.toString() || "Error counting existing books",
            );
        }
    },
);

/**
 * Method to create a new book
 */
export const add = api(
    { expose: true, method: "POST", path: "/books" },
    async (data: AddBookRequest): Promise<SingleResponse> => {
        try {
            if (!data.title || !data.authorId) {
                throw APIError.invalidArgument("Missing fields");
            }
            const result = await BookService.create(data);
            return { book: result };
        } catch (error) {
            throw APIError.aborted(error?.toString() || "Error creating the book");
        }
    },
);

/**
 * Get all books data
 */
export const list = api(
    { expose: true, method: "GET", path: "/books" },
    async (): Promise<ListResponse> => {
        try {
            const result = await BookService.find();
            return { books: result };
        } catch (error) {
            throw APIError.aborted(error?.toString() || "Error getting books data");
        }
    },
);

/**
 * Get book data by id
 */
export const readOne = api(
    { expose: true, method: "GET", path: "/books/:id" },
    async ({ id }: { id: number }): Promise<SingleResponse> => {
        try {
            const result = await BookService.findOne(id);
            return { book: result }
        } catch (error) {
            throw APIError.aborted(error?.toString() || "Error getting book data");
        }
    },
);

/**
 * Update book data
 */
export const update = api(
    { expose: true, method: "PATCH", path: "/books/:id" },
    async ({
        id,
        data,
    }: {
        id: number;
        data: Partial<AddBookRequest>;
    }): Promise<SingleResponse> => {
        try {
            const result = await BookService.update(id, data);
            return { book: result };
        } catch (error) {
            throw APIError.aborted(error?.toString() || "Error updating book");
        }
    },
);

/**
 * Delete book by id
 */
export const destroy = api(
    { expose: true, method: "DELETE", path: "/books/:id" },
    async ({ id }: { id: number }): Promise<SingleResponse> => {
        try {
            const result = await BookService.delete(id);
            return { book: result };
        } catch (error) {
            throw APIError.aborted(error?.toString() || "Error deleting book");
        }
    },
);

// Services ---------------------------------------------------------------------------------------------------


const BookService = {
    count: async (): Promise<number> => {
        const count = await prisma.book.count();
        return count;
    },


    create: async (data: AddBookRequest): Promise<Book> => {
        const book = await prisma.book.create({ data });
        return book
    },

    update: async (
        id: number,
        data: Partial<AddBookRequest>
    ): Promise<Book | null> => {
        const book = await prisma.book.findUnique({ where: { id } });

        if (!book) {
            return null
        }

        const updated = await prisma.book.update({
            where: { id },
            data: {
                title: data.title || book.title,
                authorId: data.authorId || book.authorId,
            },
        });

        return updated
    },

    find: async (): Promise<Book[]> => {
        let books: Book[] = [];
        books = await prisma.book.findMany({
            include: {
                author: true, // Populate the `author` relation
            },
        })
        return books.map((book) => book as Book);
    },

    findOne: async (id: number): Promise<Book | null> => {
        const book = await prisma.book.findUnique({
            where: { id }, include: {
                author: true, // Include the related `author` data
            },
        });
        return book ? (book as Book) : null;
    },

    delete: async (id: number): Promise<Book | null> => {
        const book = await prisma.book.findUnique({ where: { id } });
        if (!book) {
            return null
        }
        await prisma.book.delete({ where: { id } });
        return book
    },
};
