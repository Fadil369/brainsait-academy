import { notFound } from "next/navigation";
import coursesData from "@/lib/data/courses.json";
import CourseContent, { type Course } from "./CourseContent";

export function generateStaticParams() {
  return (coursesData as Course[]).map((course) => ({ slug: course.slug }));
}

export const dynamicParams = false;

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = (coursesData as Course[]).find((item) => item.slug === slug);

  if (!course) notFound();

  const relatedCourses = (coursesData as Course[])
    .filter((item) => item.topic === course.topic && item.slug !== slug)
    .slice(0, 3);

  return <CourseContent course={course} relatedCourses={relatedCourses} />;
}