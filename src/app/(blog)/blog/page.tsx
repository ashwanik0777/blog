import BlogCard from "@/components/BlogCard";
import { headers } from "next/headers";

async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

async function getBlogs() {
  try {
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/blog`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch blogs');
    }
    
    const data = await response.json();
    return data.blogs || []; // Extract blogs array from the response object
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

export default async function BlogPage() {
  let blogs = [];
  try {
    blogs = await getBlogs();
  } catch (e) {
    return <div className="p-8 text-center text-red-500">Failed to load blogs.</div>;
  }
  return (
    <main className="max-w-6xl mx-auto py-8 px-4 ">
      <h1 className="text-3xl font-bold mb-6">Latest Blogs</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {blogs.length === 0 ? (
          <div className="col-span-3 text-gray-500">No blogs found.</div>
        ) : (
          blogs.map((blog: any) => <BlogCard key={blog._id} blog={blog} />)
        )}
      </div>
    </main>
  );
}