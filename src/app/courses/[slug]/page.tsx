import { notFound } from "next/navigation";
import coursesData from "@/lib/data/courses.json";
import CourseContent, { type Course } from "./CourseContent";

export function generateStaticParams() {
  return (coursesData as Course[]).map((c) => ({ slug: c.slug }));
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = (coursesData as Course[]).find((c) => c.slug === slug);
  if (!course) notFound();

  const relatedCourses = (coursesData as Course[])
    .filter((c) => c.topic === course.topic && c.slug !== slug)
    .slice(0, 3);

  return <CourseContent course={course} relatedCourses={relatedCourses} />;
}
