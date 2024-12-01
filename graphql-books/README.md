# Encore TS With GraphQL

## Developing locally

When you have [installed Encore](https://encore.dev/docs/ts/install), you can create a new Encore application and clone this example with this command.

```bash
encore app create my-app-name --example=ts/empty
```

## Running locally

```bash
encore run
```

While `encore run` is running, open <http://localhost:9400/> to view Encore's [local developer dashboard](https://encore.dev/docs/ts/observability/dev-dash).

## Deployment

Deploy your application to a staging environment in Encore's free development cloud:

```bash
git add -A .
git commit -m 'Commit message'
git push encore
```

Then head over to the [Cloud Dashboard](https://app.encore.dev) to monitor your deployment and find your production URL.

From there you can also connect your own AWS or GCP account to use for deployment.

Now off you go into the clouds!

## Testing

```bash
encore test
```

## Commands Summary

| Command                  | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| `npx prisma init`        | Initializes Prisma and sets up the schema.              |
| `npx prisma migrate dev` | Applies migrations to the database.                     |
| `npx prisma generate`    | Generates Prisma Client for database interaction.       |
| `npm run generate`       | Runs GraphQL Code Generator to create type definitions. |
| `npx prisma studio`      | Opens Prisma Studio to manage database data.            |
| `encore run`             | Starts the Encore application locally.                  |
