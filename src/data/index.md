# Just use Elysia
**"Another JavaScript framework?"** this is the million time you heard that, JavaScript sucks.

## TypeScript sucks
You wrote 1,000,000 interface only to have it mismatch at runtime. TypeScript is just a type checker and does not guarantee type integrity at runtime.

**"But there's Zod or ArkType or TypeBox or-"** the problem is not only with validation library but ok I'll bite.

Have fun writing boilerplate to integrate them with your framework of choice.
- Express? Zodios exists just to fix that and it's not even close.
- NestJS? Good luck no using class-validator that no one use.

Elysia accept literally any validation library out of the box with zero boilerplate, and it infers types automatically.

```ts twoslash
import { Elysia, t } from 'elysia'
import { z } from 'zod'

new Elysia()
  	.get('/user/:id', ({ params }) => params.id, {
   		params: t.Object({
     		id: t.Number()
     	}),
     	headers: z.object({
	   		authorization: z.string()
	 	})
   	})
```

## Type Integrity
Your PM wants an API documentation. You spent 4 hours writing by hand and integrating a third-party library that barely works only have to rewrite it again tomorrow when your client requests changes that cause your hand-written doc to be out of date.

Now your runtime, type, OpenAPI documentation and frontend client breaks because they are all separate entities and there's 0 synchronization between them.

## End-to-end Type Safety
**"I use tRPC"**. Good choice for "backend for frontend".

Good luck using it with non-TypeScript backend and having a proper OpenAPI documentation.

## Compatible and Built-for
Elysia is <u>the only</u> mainstream framework that is **built for** Bun.

There is a huge different between being compatible and specifically built for something.
