import { notFound } from "next/navigation";
import topicsData from "@/lib/data/topics.json";
import coursesData from "@/lib/data/courses.json";
import TopicContent, { type TopicData, type CourseData } from "./TopicContent";

export function generateStaticParams() {
  return (topicsData as TopicData[])
    .filter((t) => t.count > 0)
    .map((t) => ({ slug: t.slug }));
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = (topicsData as TopicData[]).find((t) => t.slug === slug);
  if (!topic || topic.count === 0) notFound();

  const topicCourses = (coursesData as CourseData[]).filter((c) => c.topic === topic.name);

  return <TopicContent topic={topic} topicCourses={topicCourses} />;
}
