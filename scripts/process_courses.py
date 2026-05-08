#!/usr/bin/env python3
"""
Script to process courses from the ContentPipeline and create stitch templates
"""
import os
import json
import re
from pathlib import Path
from datetime import datetime
import mimetypes

def clean_filename(filename):
    """Clean filename to create course IDs"""
    # Remove special characters and spaces, keep alphanumeric and hyphens
    name = re.sub(r'[^\w\s-]', '', filename.split('.')[0])
    name = re.sub(r'[-\s]+', '-', name.strip())
    return name.lower()

def get_file_info(filepath):
    """Get file information for course metadata"""
    stat = filepath.stat()
    size = stat.st_size
    mod_time = datetime.fromtimestamp(stat.st_mtime)
    
    # Determine file type
    mime_type, _ = mimetypes.guess_type(str(filepath))
    
    if mime_type and 'audio' in mime_type:
        file_type = 'audio'
        duration = "Varies"  # Would need actual audio processing to get real duration
    elif mime_type and 'pdf' in mime_type:
        file_type = 'pdf'
        duration = "Self-paced"
    elif filepath.suffix.lower() == '.zip':
        file_type = 'archive'
        duration = "N/A"
    else:
        file_type = 'document'
        duration = "Self-paced"
    
    return {
        'size': size,
        'modified': mod_time.isoformat(),
        'type': file_type,
        'duration': duration,
        'mime_type': mime_type
    }

def create_course_structure():
    """Create course structure from files in courses directory"""
    courses_dir = Path('../../courses')
    output_dir = Path('src/lib/data/courses')
    output_dir.mkdir(exist_ok=True)
    
    courses = []
    
    # Process all files in courses directory
    for filepath in courses_dir.glob('*'):
        if filepath.is_file() and filepath.suffix.lower() in ['.pdf', '.mp3', '.zip', '.xlsx']:
            filename = filepath.name
            clean_name = clean_filename(filename)
            
            # Skip .DS_Store and other hidden files
            if filename.startswith('.'):
                continue
            
            file_info = get_file_info(filepath)
            
            # Create course entry
            course = {
                "id": f"{clean_name}",
                "title": clean_name.replace('-', ' ').title(),
                "original_filename": filename,
                "description": f"Course material: {filename}",
                "duration": file_info['duration'],
                "level": "Beginner",  # Default level
                "created_at": file_info['modified'],
                "file_size": file_info['size'],
                "file_type": file_info['type'],
                "modules": [
                    {
                        "id": f"module-{clean_name}-1",
                        "title": "Introduction",
                        "lessons": [
                            {
                                "id": f"lesson-{clean_name}-1",
                                "title": f"Course Material: {filename}",
                                "type": file_info['type'],
                                "duration": file_info['duration'],
                                "resources": [
                                    {
                                        "type": filepath.suffix.lower().strip('.'),
                                        "url": f"/courses/{filename}",
                                        "title": filename,
                                        "size": file_info['size']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
            
            courses.append(course)
            
            # Write individual course file
            course_file = output_dir / f"{clean_name}.json"
            with open(course_file, 'w', encoding='utf-8') as f:
                json.dump(course, f, indent=2, ensure_ascii=False)
            
            print(f"Created course: {clean_name} from {filename}")
    
    # Create master courses index
    master_courses = {
        "generated_at": datetime.now().isoformat(),
        "total_courses": len(courses),
        "courses": [
            {
                "id": course["id"],
                "title": course["title"],
                "description": course["description"],
                "duration": course["duration"],
                "level": course["level"],
                "file_type": course["file_type"],
                "url": f"/courses/{course['id']}"
            }
            for course in courses
        ]
    }
    
    # Write master courses file
    with open(output_dir / 'brain-sait-courses.json', 'w', encoding='utf-8') as f:
        json.dump(master_courses, f, indent=2, ensure_ascii=False)
    
    print(f"\nProcessed {len(courses)} course files")
    print(f"Created master courses file with {len(courses)} entries")

def update_topics_json():
    """Update topics.json with course categories"""
    topics_file = Path('src/lib/data/topics.json')
    
    if topics_file.exists():
        with open(topics_file, 'r', encoding='utf-8') as f:
            topics = json.load(f)
    else:
        topics = []
    
    # Add course-related topics
    course_topics = [
        {"name": "Healthcare Content Processing", "slug": "healthcare-content", "count": 0, "icon": "📚"},
        {"name": "PDF Processing", "slug": "pdf-processing", "count": 0, "icon": "📄"},
        {"name": "Audio Content Processing", "slug": "audio-content", "count": 0, "icon": "🎵"},
        {"name": "Course Materials", "slug": "course-materials", "count": 0, "icon": "🎓"},
        {"name": "Professional Development", "slug": "professional-development", "count": 0, "icon": "💼"}
    ]
    
    # Add new topics if they don't exist
    existing_slugs = set()
    if isinstance(topics, list):
        existing_slugs = {topic['slug'] for topic in topics}
    else:
        topics = []
    
    for topic in course_topics:
        if topic['slug'] not in existing_slugs:
            topics.append(topic)
    
    with open(topics_file, 'w', encoding='utf-8') as f:
        json.dump(topics, f, indent=2, ensure_ascii=False)
    
    print("Updated topics.json with course categories")

if __name__ == "__main__":
    print("Processing courses from ContentPipeline...")
    create_course_structure()
    update_topics_json()
    print("Course processing completed!")