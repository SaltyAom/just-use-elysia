---
title: Just Use Elysia
description: If you are fed up with JavaScript frameworks that doesn't care about TypeScript properly, just use Elysia, the TypeScript framework that is designed to make your life easier.
tags: ['elysia', 'framework', 'typescript', 'javascript', 'web development']
author: SaltyAom
date: 2025-12-23
layout: '../layouts/index.astro'
---

**"Another JavaScript framework?"** this is the million time you heard that.

**You are not wrong.** You lost hope because JavaScript developers rarely do things right.

<small>This article might be heavily opinionated and biased. Feels free to disagree with any parts. This article has a passive aggressive tone to convey the similar atmosphere to justfuckinguse___ and motherfuckingwebsite.</small>

## TypeScript sucks
You wrote 1,000,000 interface only to have it mismatch at runtime. TypeScript is a compile-time type checker and does not guarantee type integrity at runtime.

**"But there's Zod or ArkType or TypeBox or-"** the problem is not only with validation library but ok I'll bite.

Have fun writing boilerplate to integrate them with your framework of choice.
- Express? Zodios exists just to fix that and it's not even close.
- NestJS? Have fun not using class-validator or writing custom pipes.

Elysia accept literally any library that is compatible with [Standard Schema](https://github.com/standard-schema/standard-schema).

```typescript twoslash
import { Elysia, t } from 'elysia'
import { z } from 'zod'

new Elysia()
  	.get('/user/:id', ({ params }) => params.id, {
//   		                                     ^?
   		params: t.Object({
     		id: t.Number()
     	}),
     	headers: z.object({
	   		authorization: z.string()
	 	})
   	})
```

This is what it should looks like. Any library, no extra boilerplate, no extra decorators, infers type and just works.

I don't know why other frameworks struggle to even do this properly.

And don't get me started on OpenAPI generation because for Elysia, this is literally all it takes while other frameworks struggle to even do it properly.

## Type Integrity
Your PM wants an API documentation. You spent 4 hours writing by hand and integrating a third-party library that barely works only have to rewrite it again tomorrow when your client requests changes that cause DTOs changes.

Now your runtime, type, OpenAPI schema and frontend client breaks because they are all separate entities and there's 0 synchronization between them.

There's clearly a problem and yet no one seems or even pretend to care. Spring and FastAPI, they did it right but **no one in JavaScript cares**.

### Single Source of Truth
The answer is very obvious. Your schema is your single source of truth.

Yet no frameworks **even pretends** to do that because it's much harder than it seems.

Your schema should be used for:
1. Type Checking (TypeScript)
2. Runtime Validation
3. OpenAPI Generation
4. Pass down to Frontend similar to tRPC

When you edit your schema, everything else should update automatically, and there should be a compile-time error if something breaks.

<video class="rounded-2xl" controls>
  <source src="/assets/eden-treaty.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

You use Prisma or Drizzle? Even better, now database type is now your single source of truth and everything can be derived from it. You can even use it to validate incoming request with [Prisma Box](https://elysiajs.com/integrations/prisma.html) or [Drizzle TypeBox](https://elysiajs.com/integrations/drizzle.html).

Elysia a TypeScript framework that is designed to help you **write less TypeScript** by intelligently inferring types from your schema so you don't have to write types manually.

This works because Elysia is designed from the start for this kind of workflow and it requires a PhD in TypeScript type system to pull it off which takes 2 years of building Elysia just to make it *decent* and now rock solid.

No, other established frameworks can't do this because there will be a huge breaking changes even more than Python 2 to Python 3.

## OpenAPI
Literally, not many TypeScript frameworks can generate OpenAPI properly without a massive amount of boilerplate and hacks for some reason and no one seems to care, why?

This is what OpenAPI generation should looks like:
```typescript
import { Elysia, t } from 'elysia'
import { openapi } from '@elysiajs/openapi'

new Elysia()
	.use(openapi())
	.get('/user/:id', ({ params }) => params.id, {
		params: t.Object({
			id: t.Number()
		}),
		detail: {
			summary: 'Get user by ID',
			description: 'Returns a user object by its ID'
		}
	})
```

No hacks, no boilerplate, no extra decorators or extra annotations.

And yes, it just works, unlike other frameworks that either generate incomplete or incorrect OpenAPI schema or require you to write everything twice.

Don't believe me? [Here's a playground](https://elysiajs.com/tutorial/features/openapi/) go try it yourself.

### OpenAPI from types
This is where Elysia become interesting.

You can directly generate OpenAPI from TypeScript types.
```typescript
import { Elysia, t } from 'elysia'
import { openapi, fromTypes } from '@elysiajs/openapi'

export const app = new Elysia()
	.use(
		openapi({
			references: fromTypes()
		})
	)
```

![OpenAPI Type Gen](/assets/oai-type-gen.webp)

**"It's just Zod schema"** or **"Hono/tRPC/oRPC can do that too!"**.

[I got 50 similar replies](https://x.com/saltyAom/status/1969512978388304202) which basically sum up to this, which is funny because it proves the point exactly that this doesn't exists and people don't even think it's possible in TypeScript.

If you take a closer look, you can see that there's no schema annotation required.

- OpenAPI generated from (no manual) types
- No manual annotation required
- Doesn't require any additional configuration

This is **TypeScript type to OpenAPI** it's inferred from TypeScript types that you don't have to write which is opposite from Zod schema where you have to write it manually.

This requires an insane amount of TypeScript wizardry which no other framework even attempt to do.

Why? If you have ever done any freelancing, you will know that your QA/PM/clients will change their mind 3 times a day and cause breaking changes to your DTOs/Database schema and force you to rewrite everything again while PM require you to have an API documentation in sync when everything is falling apart for some reason, and it happens more often than you think.

Spring and FastAPI does this but not even a single JavaScript framework does this without resort to runtime schema or transformer which requires ttypescript or similar (like typia, io-ts, deepkit schema) except Elysia.

This is the only way to keep everything in sync without losing your mind.

## Type Soundness - Non-happy part
If you scroll back to OpenAPI example, you will see a response code for `200`, `418` and `420`.

What others framework do is assume that your API will always return a happy path and never really account for an proper error handling especially for JavaScript developers.

If you look into tRPC, Hono HC or oRPC, you will notice that they don't really have a proper error handling mechanism or at least the error isn't properly typed.

```typescript
import { Elysia } from 'elysia'

const app = new Elysia()
	.onBeforeHandle(({ status }) => {
		if (Math.random() > 0.5)
			return status(418)
		else if (Math.random() > 0.5)
			return status(420)
	})
	.get('/thing', () => {
		return 'all good' as const
	})

type app = typeof app

//---cut---
import { treaty } from '@elysiajs/eden'

const api = treaty<app>('api.thing.com')

const { data, error } = await api.thing.get()
//            ^?
if (error) {
	switch (error.status) {
		case 418:
			console.log(error)
			break

		case 420:
			console.log(error)
			break
	}
} else {
	data
//   ^?
}
```

Which for some reason, other frameworks doesn't handle it properly in a type-safe manner because TypeScript limitation or other excueses but it make your life miserable when you have to deal with it in real-world applications.

One of the greatest thing is, if you scroll back again to the OpenAPI example, you will notice that in the route handler section, it only returns 200 but because it has a `beforeHandle` event applied to that can return `418` or `420`, Elysia is smart enough to infer that those are also possible response codes from any part of life-cycle events that is applied to that route (even from plugin).

Which means any part of your application that can cause an error, Elysia will automatically account that error in a type-safe manner.

And because it's inferred from a your actual code, you can be sure that there's no mismatch between your type and runtime behavior and if you change something, it will cause a compile-time error forcing you to fix it before it goes to production.

This is refers as **type soundness** and no other frameworks even attempt to do this due to how hard it is to pull off.

## Dependency
Elysia force you to think about dependency graph of your application.

When you need a `user` property, you have to explicitly state it with `use`.

```typescript
// @errors: 2353
import { Elysia } from 'elysia'

const auth = new Elysia()
	.macro({
		auth: {
			resolve() {
				return {
					user: {
						name: 'SaltyAom'
					}
				}
			}
		}
	})
//---cut---
new Elysia()
	.use(auth)
	.get('/profile', ({ user }) => `Hello, ${user.name}`, {
  		auth: true
   	})
```

This makes any part of Elysia a micro-app that can be split out and run independently.

You don't declare a global type, ever.
1. There's a TypeScript limitation
2. It break the dependency awareness and extremely hard to pin down where a property come from
3. It doesn't enforce type integrity which is the whole point of Elysia

It's designed to be able to convert from monolithic to microservice architecture or vice-versa in minutes because some random PMs (and there are a lot) decided to change their mind mid project and force you to do so.

## Performance
Every frameworks will claim that they are **blazingly fast** but none lives up to it claims.

We wrote a short research paper publish to [ACM (Association for Computing Machinery) Digital Library](https://dl.acm.org/doi/10.1145/3605098.3636068) which breifly explain how we use Static Code Analysis to optimize runtime performance to remove most runtime overhead by using JIT compilation.

The paper is behind a paywall but you can read a summary at [Elysia performance optimization](https://saltyaom.com/blog/elysia-sucrose/).

Otherwise, there are several benchmarks like:
- [Techempower Benchmark R23](https://www.techempower.com/benchmarks/#section=data-r23&test=query)
- [Web Framework Benchmark](https://web-frameworks-benchmark.netlify.app/)
- [Bun HTTP Benchmark](https://github.com/saltyaom/bun-http-benchmark)

Which should consistently shows that Elysia is near the level of compiled langauge frameworks like Go Fiber or Rust Axum.

## But there are other frameworks that do that-
No, there aren't.

You have to be insanely crazy and invest several years to pull off, to name a few:
1. Type Soundness that happens every possible intend errors
2. OpenAPI generation that just works without any boilerplate
3. OpenAPI from TypeScript types, not runtime schema
4. End-to-end type safe RPC-like client
5. Seamless OpenTelemetry integration
6. Near 0 overhead runtime performance optimization using Static Code Analysis
7. Type performance optimization that requires insane TypeScript wizardry

## Hono - Difference between Compatible and Built-for
So you use Hono with Bun? Hono is great for Cloudflare Workers but not Bun.

Need a Bun specific features?
- `server.publish` to push message to WebSocket clients? Nope.
- `Bun.file` to serve static files? Nope.
- `Bun.serve.routes` for better performance? Nope.
- Want to try [Bun Fullstack Dev Server](https://bun.com/docs/bundler/fullstack#fullstack-dev-server)! You wish.

Elysia can use [Bun Fullstack Dev Server](https://bun.com/docs/bundler/fullstack#fullstack-dev-server) which you can directly create an React app with a single line of code which is direct competitor to Hono X.

<video class="rounded-2xl" controls>
  <source src="/assets/bun-fullstack.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

> Source code [on GitHub](https://github.com/SaltyAom/elysia-fullstack-example) to run locally

Or if you don't want that, Elysia can also just use JSX and don't get me starts on [Hono type limit](https://github.com/honojs/hono/issues/2399) which doesn't exists on Elysia.

There is a huge different between being compatible and specifically built for something and Elysia is <u>the only</u> framework that takes Bun seriously and built specifically for it.

[Hono is originally built for Cloudflare Workers](https://www.youtube.com/watch?v=4ks1RvEM99Y) and later made compatible with Bun and Node but so is Elysia is originally built for Bun. Hono maintainer is now also works at Cloudflare and Cloudflare back a lot on Hono so it's obvious where their focus is.

You would never get to use Bun native features properly with Hono, nor performance or good TypeScript experience as Elysia but is also vice-versa for Elysia on Cloudflare Workers.

Want a more detail comparison? [Here's a syntax comparison](https://elysiajs.com/migrate/from-hono.html).

If you want a better Express, Hono is great. But do you want just a better Express.

### Runtime portability	
Oh? you use Hono because "it works any runtime?" Cute.

How many time have you ever switch runtime? If you really want runtime portability, you would be using Nitro and yet you aren't.

You can use Elysia with Node or Deno or Cloudflare Workers or Vercel or **directly in your browser** or whatever.

[Elysia playground](https://elysiajs.com/tutorial/) is literally running an literal Elysia directly in your browser.

## tRPC - Locked-in to TypeScript
**"I use tRPC"**. Good choice for "backend for frontend".

[Elysia does that too](https://elysiajs.com/eden/overview.html).

Good luck using it with non-TypeScript backend and having a proper OpenAPI documentation, and don't get me start on how to upload a file and with correct type and validate it properly.

Not convincing enough? [Here's a comparison](https://elysiajs.com/migrate/from-trpc.html).

## Express - Decade old technical debt
Express is the jQuery of backend framework. It's literally abandoned and took 10 years to update from 4.x to 5.0.

The only reason people still use it is because either they are forced to and every single bootcamp/tutorial use it.

[Why you should use Elysia over Express](https://elysiajs.com/migrate/from-express.html) especially in Bun.

## Bus Factor
**"I don't use Elysia because it's maintain by 1 person".**

If you still use Express in production, you don't get to complain about bus factor.

SaltyAom is just a **lead maintainer**, there are 4 more who contribute regulary and 100+ more contributors on Elysia.

Speculatively (probably wrong):
- Hono is **mainly** lead by 1 person and regularly maintain by 2-3 more people.
- tRPC is **mainly** lead by 2-3 people and regularly maintain by 3-5 more people.
- Express is literally abandoned for a decade until recently got a governance.

And it's literally an MIT license, you can fork it and do whatever with it if I died tomorrow. But in case that happens, I already have someone else to take over who are much more capable than me.

## I just want to build my app
I built Elysia not because I want to but because I was frustrated with existing frameworks.

I does 5 years of freelancing using Express, NestJS, Fastify, Koa, tRPC or several other frameworks and none of it fixes the extreme workflows (and insane PM/clients) or 3 times a day requirement changes that broke everything that I have to deal with every single day.

Trust me, the last thing I would do is to create another JavaScript framework but I hate that there's no single framework that can solve my problems even more.

I didn't create Elysia just for fun but to solve real-world problems that people don't even bother to solve.

And one more thing, when I says it's hard to pull it off in type level, I really means it. [TypeScript type is turing complete](https://github.com/microsoft/TypeScript/issues/14833) and I wrote [GraphQL parser in Type Level](https://x.com/saltyAom/status/1687000580261289984) in 2 days or [simple type-aware SQL SELECt parser in a day](https://x.com/saltyAom/status/1824399487407685959?s=20) but it took me almost 3 years to make Elysia type soundness decent and fast enough for real-world applications due to shear complexity of TypeScript type system and its limitation.

If you're curious, I'd recommend take a look at [Elysia code around starting from line 4,100+](https://github.com/elysiajs/elysia/blob/main/src/index.ts) which should give you a glimpse of how complex it is to pull it off. It even handle encapsulation in type-level.

Also don't trust a random internet person. Try it yourself then come back and tell me I'm wrong.

## Just try it

Literally, it took you just few minutes to up and running.

```bash
bun create elysia app
```

Is that hard? No?

There's even an interactive tutorial that you can try directly in your browser at [Elysia Tutorial](https://elysiajs.com/tutorial/), which as mentioned, run directly in your browser so it teach you have you actually use Elysia or an LLM you can ask questions to when you're stuck.

If you fed up with JavaScript framework, the question isn't **"Why another JavaScript framework?"** but rather **"Why are you satisfied with the current state of JavaScript?"**.

If you want something better, you have to try something different even if it's *another JavaScript framework*.

Of course, Elysia isn't perfect and might not be for your taste but it's one of the only few frameworks of this decade that actually attempt to solve real-world problems that exists for years.

It's ok if you tried but didn't like it, you can always stick with your favorite framework. But don't complain about other people solution if you know the problems exists and don't even try to fix the problems or try something different.

<section class="text-2xl">

> The definition of insanity is doing the same thing over and over and expecting different results
>
> -- Albert Eistein

</section>
