import { Hono } from "hono";

export const personalRoute = new Hono();
personalRoute.get().post().patch().delete();

export const educationRoute = new Hono();
educationRoute.get().post().patch().delete();

export const workExpRoute = new Hono();
workExpRoute.get().post().patch().delete();

export const orgExpRoute = new Hono();
orgExpRoute.get().post().patch().delete();

export const projectsRoute = new Hono();
projectsRoute.get().post().patch().delete();

export const coursesRoute = new Hono();
coursesRoute.get().post().patch().delete();
