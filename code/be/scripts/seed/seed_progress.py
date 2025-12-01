"""
Seed progress records for completed sessions.
Run this after seed_sessions.py.
"""
import asyncio
import os
import sys
from datetime import datetime, timezone

sys.path.append(os.getcwd())

from app.db.mongodb import init_db
from app.models.internal.session import TutorSession, SessionStatus
from app.models.internal.progress import ProgressRecord


async def seed_progress():
    """Create progress records for completed sessions."""
    print("📊 SEEDING PROGRESS RECORDS...")
    await init_db()
    
    # Get completed sessions
    completed_sessions = await TutorSession.find(
        TutorSession.status == SessionStatus.COMPLETED
    ).to_list()
    
    if not completed_sessions:
        print("⚠️  WARNING: No completed sessions found. Run seed_sessions.py first.")
        return
    
    # Fetch all links for sessions
    for session in completed_sessions:
        await session.fetch_all_links()
    
    progress_records = []
    
    # Expanded progress templates for 20+ sessions
    progress_templates = [
        {
            "topic": "Software Architecture Patterns - MVC, MVP, MVVM",
            "performance": "Good understanding. Student grasped the differences between patterns quickly. Needs more practice with MVVM implementation.",
            "next_steps": "Practice implementing MVVM in a small project. Review observer pattern.",
            "attachments": ["https://drive.google.com/file/architecture-slides", "https://github.com/example/mvc-demo"]
        },
        {
            "topic": "Data Structures - Binary Search Trees, AVL Trees",
            "performance": "Student understands BST operations well. Had some difficulty with AVL rotations initially but improved after practice.",
            "next_steps": "Solve 5 more problems on AVL tree operations. Focus on double rotations.",
            "attachments": ["https://drive.google.com/file/tree-practice-problems"]
        },
        {
            "topic": "Engineering Fundamentals - Statics, Free Body Diagrams, Equilibrium",
            "performance": "Solid foundation. Able to solve equilibrium problems independently by end of session.",
            "next_steps": "Complete practice set chapter 3. Review moment calculations.",
            "attachments": []
        },
        {
            "topic": "Algorithm Design - Divide and Conquer, Dynamic Programming",
            "performance": "Strong grasp of divide and conquer. DP memoization needs more work.",
            "next_steps": "Practice classic DP problems: knapsack, longest common subsequence.",
            "attachments": ["https://leetcode.com/problemset/dynamic-programming/"]
        },
        {
            "topic": "Object-Oriented Programming - Inheritance, Polymorphism, Encapsulation",
            "performance": "Good progress with inheritance. Polymorphism concepts were challenging but student showed improvement.",
            "next_steps": "Implement a small project using polymorphism. Review interface vs abstract class.",
            "attachments": []
        },
        {
            "topic": "Database Design - Normalization, ER Diagrams, SQL Queries",
            "performance": "Excellent understanding of normalization up to 3NF. SQL query optimization needs practice.",
            "next_steps": "Practice complex JOIN queries. Review indexing strategies.",
            "attachments": ["https://www.db-fiddle.com/practice"]
        },
        {
            "topic": "Web Development - React Hooks, State Management",
            "performance": "Student comfortable with useState and useEffect. Context API was new but understood with examples.",
            "next_steps": "Build a small app using Context API. Explore useReducer for complex state.",
            "attachments": ["https://github.com/example/react-hooks-demo"]
        },
        {
            "topic": "Computer Networks - TCP/IP, HTTP, Socket Programming",
            "performance": "Good theoretical knowledge. Hands-on socket programming was challenging but improved.",
            "next_steps": "Complete client-server chat application. Review network layers.",
            "attachments": []
        },
        {
            "topic": "Graph Algorithms - BFS, DFS, Shortest Path",
            "performance": "Excellent grasp of graph traversal. Dijkstra's algorithm implementation was solid.",
            "next_steps": "Practice on more complex graph problems. Study Floyd-Warshall algorithm.",
            "attachments": []
        },
        {
            "topic": "System Design - Scalability, Load Balancing, Caching",
            "performance": "Good conceptual understanding. Needs more real-world examples to solidify knowledge.",
            "next_steps": "Read case studies on Netflix, Uber architecture. Design a simple scalable system.",
            "attachments": ["https://github.com/donnemartin/system-design-primer"]
        },
        {
            "topic": "Operating Systems - Process Management, Memory Allocation",
            "performance": "Strong theoretical foundation. Struggled with page replacement algorithms initially.",
            "next_steps": "Practice more OS scheduling problems. Review virtual memory concepts.",
            "attachments": []
        },
        {
            "topic": "Software Testing - Unit Tests, Integration Tests, TDD",
            "performance": "Student understood the importance of testing. Wrote good unit tests by end of session.",
            "next_steps": "Practice TDD approach on next project. Learn mocking frameworks.",
            "attachments": ["https://github.com/example/testing-demo"]
        },
        {
            "topic": "Compiler Design - Lexical Analysis, Parsing, Code Generation",
            "performance": "Complex topic but student kept up well. Parse tree construction needs more practice.",
            "next_steps": "Build a simple calculator parser. Review context-free grammars.",
            "attachments": []
        },
        {
            "topic": "Machine Learning Basics - Linear Regression, Classification",
            "performance": "Good intuition for ML concepts. Python implementation was challenging but improved.",
            "next_steps": "Complete Kaggle beginner competitions. Study gradient descent in depth.",
            "attachments": ["https://www.kaggle.com/learn"]
        },
        {
            "topic": "Mobile Development - Android UI, Activity Lifecycle",
            "performance": "Fast learner. Built first app successfully. Fragment management needs more work.",
            "next_steps": "Practice navigation patterns. Build a multi-screen app.",
            "attachments": []
        },
        {
            "topic": "Security Fundamentals - Encryption, Authentication, Authorization",
            "performance": "Excellent attention to security details. Implemented JWT authentication correctly.",
            "next_steps": "Study OAuth 2.0 flow. Practice secure coding patterns.",
            "attachments": ["https://owasp.org/www-project-top-ten/"]
        },
        {
            "topic": "Cloud Computing - AWS Services, Serverless Architecture",
            "performance": "Good understanding of cloud concepts. Deployed first Lambda function successfully.",
            "next_steps": "Explore S3, DynamoDB integration. Study CI/CD with AWS.",
            "attachments": []
        },
        {
            "topic": "Design Patterns - Singleton, Factory, Observer, Decorator",
            "performance": "Student can identify patterns in code. Implementation needs more practice.",
            "next_steps": "Refactor existing project to use appropriate patterns. Read 'Head First Design Patterns'.",
            "attachments": []
        },
        {
            "topic": "Version Control - Git Branching, Merging, Conflict Resolution",
            "performance": "Mastered basic git commands. Merge conflicts were challenging but resolved successfully.",
            "next_steps": "Practice rebasing. Contribute to open source projects.",
            "attachments": ["https://learngitbranching.js.org/"]
        },
        {
            "topic": "API Development - RESTful Design, Documentation, Versioning",
            "performance": "Built clean REST API. Needs to improve error handling and validation.",
            "next_steps": "Study API best practices. Add comprehensive error messages.",
            "attachments": ["https://swagger.io/docs/"]
        },
    ]
    
    # Create progress for each completed session
    for i, session in enumerate(completed_sessions):
        template = progress_templates[i % len(progress_templates)]
        
        # Create progress for each student in the session
        for student in session.students:
            # Customize performance based on student
            performance = template["performance"]
            if len(session.students) > 1:
                # Group session - add group dynamics note
                if student == session.students[0]:
                    performance += " Actively participated in group discussion."
                else:
                    performance += " Helped explain problems to other students during group discussion."
            
            progress = ProgressRecord(
                session=session,
                tutor=session.tutor,
                student=student,
                topic_covered=template["topic"],
                student_performance=performance,
                next_steps=template["next_steps"],
                attachment_urls=template["attachments"]
            )
            progress_records.append(progress)
            await progress.save()
    
    print(f"✅ Created {len(progress_records)} progress records")
    print(f"   - For {len(completed_sessions)} completed sessions")


if __name__ == "__main__":
    asyncio.run(seed_progress())
