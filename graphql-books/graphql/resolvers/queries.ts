import { book as bookClient, user as userClient } from "~encore/clients";
import { QueryResolvers } from "../__generated__/resolvers-types";

// Use the generated `QueryResolvers` type to type check our queries!
const queries: QueryResolvers = {
    books: async () => {
        const { books } = await bookClient.list();
        return books;
    },
    getBookById: async (_, { id }) => {
        const { book } = await bookClient.readOne({ id });
        return book;
    },
    users: async () => {
        const { users } = await userClient.list();
        return users;
    },
    getUserById: async (_, { id }) => {
        const { user } = await userClient.readOne({ id });
        return user;
    },

};

export default queries;
