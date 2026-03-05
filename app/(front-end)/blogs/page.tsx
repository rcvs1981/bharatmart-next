import BlogCard from "@/components/frontend/BlogCard";
import { getData } from "@/lib/getData";
import React from "react";

type BlogItem = {
  id?: string;
  title: string;
  slug: string;
  imageUrl: string;
  createdAt: string;
  categoryId: string;
};

export default async function BlogsPage() {
  let blogs: BlogItem[] = [];

  try {
    blogs = await getData<BlogItem[]>("trainings");
  } catch {
    blogs = [];
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Blogs
        </h1>
        {blogs.length > 0 ? (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog.id ?? blog.slug} training={blog} />
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Blog content will appear here soon.
          </p>
        )}
      </div>
    </section>
  );
}
