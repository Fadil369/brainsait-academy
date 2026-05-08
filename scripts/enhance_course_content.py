#!/usr/bin/env python3
"""
Script to enhance course templates with actual content extracted from PDF and MP3 files
"""
import os
import json
import PyPDF2
import subprocess
import tempfile
from pathlib import Path
from datetime import datetime
import mimetypes
import re

def extract_pdf_content(pdf_path):
    """Extract text content from PDF file"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text_content = []
            
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    text = page.extract_text()
                    if text.strip():
                        text_content.append(f"PAGE_{page_num + 1}:\n{text.strip()}\n")
                except Exception as e:
                    print(f"Warning: Could not extract text from page {page_num + 1}: {str(e)}")
                    continue
            
            return "\n".join(text_content) if text_content else "No readable text content found in PDF."
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {str(e)}")
        return f"Error extracting PDF content: {str(e)}"

def transcribe_mp3(mp3_path):
    """Transcribe MP3 file using whisper (placeholder - would need actual whisper setup)"""
    try:
        # This is a placeholder - in a real implementation you'd use whisper or similar
        # For now, we'll return a placeholder transcription
        file_size = os.path.getsize(mp3_path)
        duration_estimate = f"Approximate duration based on file size: {file_size / 1024 / 1024:.1f} MB"
        
        return f"AUDIO TRANSCRIPTION PLACEHOLDER\nFile: {os.path.basename(mp3_path)}\n{duration_estimate}\nActual transcription would require Whisper AI or similar service."
    except Exception as e:
        print(f"Error processing MP3 {mp3_path}: {str(e)}")
        return f"Error processing audio file: {str(e)}"

def clean_filename(filename):
    """Clean filename to create course IDs"""
    name = re.sub(r'[^\w\s-]', '', filename.split('.')[0])
    name = re.sub(r'[-\s]+', '-', name.strip())
    return name.lower()

def process_course_with_content():
    """Enhance existing course templates with actual content"""
    courses_dir = Path('../../courses')
    template_dir = Path('src/lib/data/courses')
    
    # Get all existing course templates
    for template_file in template_dir.glob('*.json'):
        if template_file.name == 'brain-sait-courses.json':
            continue  # Skip the master index
            
        with open(template_file, 'r', encoding='utf-8') as f:
            course_data = json.load(f)
        
        # Find the corresponding original file
        original_filename = course_data.get('original_filename')
        if not original_filename:
            continue
            
        original_file = courses_dir / original_filename
        
        if not original_file.exists():
            print(f"Original file not found: {original_file}")
            continue
        
        # Extract content based on file type
        content = ""
        if original_file.suffix.lower() == '.pdf':
            print(f"Extracting content from PDF: {original_filename}")
            content = extract_pdf_content(str(original_file))
        elif original_file.suffix.lower() == '.mp3':
            print(f"Processing audio file: {original_filename}")
            content = transcribe_mp3(str(original_file))
        else:
            content = f"File content extraction not implemented for {original_file.suffix}"
        
        # Enhance the course data with content
        if 'modules' in course_data and len(course_data['modules']) > 0:
            if 'lessons' in course_data['modules'][0] and len(course_data['modules'][0]['lessons']) > 0:
                # Add content to the first lesson
                course_data['modules'][0]['lessons'][0]['content'] = content[:10000]  # Limit content size
                course_data['modules'][0]['lessons'][0]['full_content_available'] = len(content) > 10000
                course_data['modules'][0]['lessons'][0]['content_type'] = original_file.suffix.lower().strip('.')
        
        # Add course-level content summary
        course_data['content_summary'] = content[:500] + "..." if len(content) > 500 else content
        course_data['has_extracted_content'] = True
        
        # Write enhanced course data back
        with open(template_file, 'w', encoding='utf-8') as f:
            json.dump(course_data, f, indent=2, ensure_ascii=False)
        
        print(f"Enhanced course template: {template_file.name}")

def update_master_index():
    """Update the master courses index to reflect content availability"""
    master_file = Path('src/lib/data/courses/brain-sait-courses.json')
    
    if master_file.exists():
        with open(master_file, 'r', encoding='utf-8') as f:
            master_data = json.load(f)
        
        # Update the master index to indicate content availability
        for course in master_data['courses']:
            course_file = Path(f"src/lib/data/courses/{course['id']}.json")
            if course_file.exists():
                with open(course_file, 'r', encoding='utf-8') as f:
                    course_detail = json.load(f)
                
                # Update course info with content status
                course['has_content'] = course_detail.get('has_extracted_content', False)
                course['content_type'] = course_detail.get('file_type', 'unknown')
                course['extracted_on'] = datetime.now().isoformat()
        
        with open(master_file, 'w', encoding='utf-8') as f:
            json.dump(master_data, f, indent=2, ensure_ascii=False)
        
        print("Updated master index with content availability")

if __name__ == "__main__":
    print("Enhancing course templates with actual content...")
    process_course_with_content()
    update_master_index()
    print("Course content enhancement completed!")