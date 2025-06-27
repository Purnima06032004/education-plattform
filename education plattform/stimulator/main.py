import yaml
import time
import random
import requests
import json
import logging
from datetime import datetime
import threading
import sys
import os
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("elearning-simulator")


class BaseUser:
    """Base class for all user types with common functionality"""

    def __init__(self, name: str, email: str, password: str, role: str, api_url: str):
        """Initialize a user with basic information"""
        self.name = name
        self.email = email
        self.password = password
        self.role = role
        self.api_url = api_url
        self.token = None
        self.user_data = None  # Will store user data returned from API
        self.last_activity = None
        self.active = True
        self.id = None

    def __str__(self):
        return f"{self.name} ({self.role})"

    def register(self) -> bool:
        """Register user with the backend"""
        user_data = {
            "name": self.name,
            "email": self.email,
            "password": self.password,
            "role": self.role
        }

        try:
            response = requests.post(
                f"{self.api_url}/users/register",
                json=user_data,
                timeout=5
            )

            if response.status_code < 400:
                try:
                    self.user_data = response.json().get("user")
                    logger.info(f"Registered user: {self}")
                    return True
                except json.JSONDecodeError:
                    self.user_data = {"name": self.name, "email": self.email}
                    logger.warning(f"User registration returned non-JSON response for {self}")
                    return True
            else:
                logger.warning(f"Failed to register user {self}: {response.text}")
                return False

        except requests.RequestException as e:
            logger.error(f"Error registering user {self}: {e}")
            return False

    def login(self) -> bool:
        """Authenticate with the backend to get a token"""
        login_data = {
            "email": self.email,
            "password": self.password
        }

        try:
            response = requests.post(
                f"{self.api_url}/users/login",
                json=login_data,
                timeout=5
            )

            if response.status_code < 400:
                try:
                    data = response.json()
                    self.token = data.get("data")
                    if self.token:
                        logger.info(f"User logged in: {self}")
                        return True
                    else:
                        logger.warning(f"Login successful but no token received for {self}")
                        return False
                except json.JSONDecodeError:
                    logger.warning(f"Login returned non-JSON response for {self}")
                    return False
            else:
                logger.warning(f"Failed to login user {self}: {response.text}")
                return False

        except requests.RequestException as e:
            logger.error(f"Error logging in user {self}: {e}")
            return False

    def make_request(self, method: str, endpoint: str, data: Dict = None) -> Dict:
        """Make an authenticated API request"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        try:
            if method.lower() == "get":
                response = requests.get(url, headers=headers, timeout=5)
            elif method.lower() == "post":
                response = requests.post(url, json=data, headers=headers, timeout=5)
            elif method.lower() == "put":
                response = requests.put(url, json=data, headers=headers, timeout=5)
            elif method.lower() == "delete":
                response = requests.delete(url, headers=headers, timeout=5)
            else:
                logger.error(f"Unsupported HTTP method: {method}")
                return {"success": False, "error": "Unsupported HTTP method"}

            # Record activity timestamp
            self.last_activity = datetime.now()

            if response.status_code >= 400:
                logger.warning(f"API Error {response.status_code}: {response.text}")
                return {"success": False, "error": f"HTTP {response.status_code}", "details": response.text}

            if response.content:
                try:
                    return response.json()
                except json.JSONDecodeError:
                    return {"success": True, "raw": response.text}
            return {"success": True}

        except requests.RequestException as e:
            logger.error(f"Request error ({method} {endpoint}): {e}")
            return {"success": False, "error": str(e)}

    def behave(self, min_delay: int, max_delay: int):
        """Base behavior loop for all users"""
        logger.info(f"Starting behavior simulation for {self}")
        self.set_user_id()
        while self.active:
            try:
                # Perform role-specific behavior (implemented by subclasses)
                self.perform_action()

                # Random delay between actions
                delay = random.uniform(min_delay, max_delay)
                time.sleep(delay)

            except Exception as e:
                logger.error(f"Error in behavior simulation for {self}: {e}")
                time.sleep(max_delay)  # Wait a bit longer after an error

    def set_user_id(self):
        user = self.make_request("get", f"users/email?email={self.email}")
        self.id = user['data'].get('id')

    def perform_action(self):
        """To be implemented by subclasses"""
        pass

    def stop(self):
        """Stop this user's behavior simulation"""
        self.active = False


class Student(BaseUser):
    """Student user that enrolls in courses and makes progress"""

    def __init__(self, name: str, email: str, password: str, api_url: str):
        super().__init__(name, email, password, "student", api_url)
        self.enrolled_courses = []  # List of course IDs

    def perform_action(self):
        """Perform a random student action"""
        # Select a random action

        actions = [
            self.browse_courses,
            self.view_enrolled_course,
            self.make_progress,
            self.check_notifications
        ]
        # Weight actions - make progress more frequent
        weights = [0.1, 0.1, 0.4, 0.4]

        # Choose and perform an action
        action = random.choices(actions, weights=weights, k=1)[0]
        action()

    def browse_courses(self):
        """Browse available courses, maybe enroll in one"""
        logger.info(f"Student {self} is browsing courses")
        courses = self.make_request("get", "courses")

        # Maybe enroll in a course
        if random.random() < 0.3 and len(courses) > 0:
            if courses:
                # Filter out courses already enrolled in
                available_courses = [c for c in courses if c["id"] not in self.enrolled_courses]
                if available_courses:
                    course = random.choice(available_courses)
                    self.enroll_in_course(course["id"], self.id)

    def enroll_in_course(self, course_id, user_id):
        """Enroll in a specific course"""
        enrollment_data = {
            "course_id": course_id,
            "user_id": user_id
        }
        logger.info(f"Student {self.id} is enrolling in course {course_id}")
        result = self.make_request("post", "enrollments", enrollment_data)

        if "success" not in result.get("status"):
            return

        enrollment = result.get("data", [])

        if not enrollment:
            return

        if "course_id" in enrollment:
            self.enrolled_courses.append(course_id)
            logger.info(f"Student {self} enrolled in course {course_id}")
        else:
            logger.warning(f"Failed to enroll student {self} in course {course_id}")

    def view_enrolled_course(self):
        """View details of an enrolled course"""
        if not self.enrolled_courses:
            # If not enrolled in any courses, browse instead
            self.browse_courses()
            return

        course_id = random.choice(self.enrolled_courses)
        logger.info(f"Student {self} is viewing course {course_id}")
        self.make_request("get", f"courses/{course_id}")

        # Also view the course contents
        self.make_request("get", f"course-content/{course_id}")

    def make_progress(self):
        """Make progress in an enrolled course"""
        logger.info(f"Student {self} makes progress")
        if not self.enrolled_courses:
            # If not enrolled in any courses, browse instead
            self.browse_courses()
            return

        course_id = random.choice(self.enrolled_courses)

        # Get course contents
        result = self.make_request("get", f"course-content/{course_id}")
        if "success" not in result.get("status"):
            return

        contents = result.get("data", [])
        if not contents:
            return

        # Choose a random content item
        content = random.choice(contents)
        content_id = content["id"]

        # Record progress
        # time_spent = random.randint(60, 900)  # 1-15 minutes
        progress_data = {
            "user_id": self.id,
            "course_id": course_id,
            "content_id": content_id
        }

        logger.info(f"Student {self} is making progress in course {course_id}")
        self.make_request("post", "progress", progress_data)

    def check_notifications(self):
        """Check for notifications"""
        logger.info(f"Student {self} is checking notifications")
        notifications = self.make_request("get", f"notifications/{self.id}")


class Instructor(BaseUser):
    """Instructor user that creates and manages courses"""

    def __init__(self, name: str, email: str, password: str, api_url: str, course_topics: List[str],
                 content_types: List[str]):
        super().__init__(name, email, password, "instructor", api_url)
        self.course_topics = course_topics
        self.content_types = content_types
        self.courses = []  # List of course IDs created by this instructor

    def perform_action(self):
        """Perform a random instructor action"""
        # Select a random action
        actions = [
            self.create_course,
            self.check_enrollments,
            self.add_content,
            self.update_course,
            self.send_notification
        ]

        # Weight actions - creating content and checking progress more frequent
        weights = [0.1, 0.15, 0.2, 0.25, 0.3]

        # Choose and perform an action
        action = random.choices(actions, weights=weights, k=1)[0]
        action()

    def create_course(self):
        """Create a new course"""
        topic = random.choice(self.course_topics)
        difficulty = random.choice(["Beginner", "Intermediate", "Advanced"])

        course_data = {
            "title": f"{topic} {difficulty} Course",
            "description": f"Learn {topic} from scratch to expert level. This is a {difficulty.lower()} level course.",
            "instructor_id": str(self.id)
        }

        logger.info(f"Instructor {self} is creating a new course")
        result = self.make_request("post", "courses", course_data)

        if "success" not in result.get("status"):
            return

        data = result.get("data", [])
        if result:
            course_id = data.get("id")
            self.courses.append(course_id)
            logger.info(f"Instructor {self} created course {course_id}")

            # Add initial content to the course
            for i in range(3):  # Add 3 initial content items
                self.add_content_to_course(course_id, i + 1)
        else:
            logger.warning(f"Failed to create course for instructor {self}")

    def add_content_to_course(self, course_id, order):
        """Add content to a specific course"""
        content_type = random.choice(self.content_types)
        content_data = {}
        if content_type == "video":
            content_data = {
                "url": f"https://example.com/video/{course_id}/lesson{order}"
            }
        elif content_type == "pdf":
            content_data = {
                "url": f"https://example.com/pdf/{course_id}/document{order}.pdf"
            }
        else:
            content_data = {
                "url": f"https://example.com/img/{course_id}/image{order}.png"
            }

        content_item = {
            "course_id": course_id,
            "type": content_type,
            "content": content_data,
            "order": order
        }

        logger.info(f"Instructor {self} is adding content to course {course_id}")
        self.make_request("post", f"course-content/", content_item)

    def check_enrollments(self):
        """Check enrollments for a course"""
        if not self.courses:
            self.create_course()
            return

        course_id = random.choice(self.courses)
        logger.info(f"Instructor {self} is checking enrollments for course {course_id}")
        self.make_request("get", f"enrollments/course/{course_id}")

    def add_content(self):
        """Add new content to an existing course"""
        if not self.courses:
            self.create_course()
            return

        course_id = random.choice(self.courses)

        # Get current content to determine next order
        result = self.make_request("get", f"course-content/{course_id}")

        if "success" not in result.get("status"):
            return

        contents = result.get("data", [])
        next_order = len(contents) + 1

        self.add_content_to_course(course_id, next_order)

    def update_course(self):
        """Update course details"""
        if not self.courses:
            self.create_course()
            return

        course_id = random.choice(self.courses)

        # Get current course details
        result = self.make_request("get", f"courses/{course_id}")
        if "success" not in result.get("status"):
            return

        course = result['data']
        if "id" in course:
            return

        update_data = {
            "title": course.get("title", f"Course {course_id}"),  # Keep same title
            "description": course.get("description", "") + f" Updated on {datetime.now().strftime('%Y-%m-%d')}."
        }

        logger.info(f"Instructor {self} is updating course {course_id}")
        self.make_request("put", f"courses/{course_id}", update_data)

    def send_notification(self):
        """Send notification to students in a course"""
        if not self.courses:
            self.create_course()
            return

        course_id = random.choice(self.courses)

        # Get course details for title
        result = self.make_request("get", f"courses/{course_id}")
        if "success" not in result.get("status"):
            return

        course = result.get("data", {})
        course_title = course.get("title", f"Course {course_id}")

        # Get enrollments to find students
        enrollments_result = self.make_request("get", f"enrollments/course/{course_id}")

        if "success" not in enrollments_result.get("status"):
            return

        enrollments = enrollments_result.get('data', [])
        if not enrollments:
            return

        message_templates = [
            f"Don't forget to complete the latest module in {course_title}!",
            f"New live session for {course_title} scheduled next week!",
            f"Office hours available for {course_title} students tomorrow.",
            f"Important deadline approaching for {course_title} assignment!"
        ]

        message = random.choice(message_templates)

        # Send notification to each enrolled student
        for enrollment in enrollments:
            notification_data = {
                "user_id": enrollment.get("user_id"),
                "message": message
            }

            logger.info(f"Instructor {self} is sending notification to student in course {course_id}")
            self.make_request("post", "notifications", notification_data)


class Admin(BaseUser):
    """Admin user that monitors the platform"""

    def __init__(self, name: str, email: str, password: str, api_url: str):
        super().__init__(name, email, password, "admin", api_url)

    def perform_action(self):
        """Perform a random admin action"""
        # Select a random action
        actions = [
            self.view_all_users,
            self.view_all_courses,
            self.check_course_metrics
        ]

        # Equal weights for admin actions
        weights = [0.33, 0.33, 0.34]

        # Choose and perform an action
        action = random.choices(actions, weights=weights, k=1)[0]
        action()

    def view_all_users(self):
        """View list of all users"""
        logger.info(f"Admin {self} is viewing all users")
        self.make_request("get", "users")

    def view_all_courses(self):
        """View list of all courses"""
        logger.info(f"Admin {self} is viewing all courses")
        self.make_request("get", "courses")

    def check_course_metrics(self):
        """Check metrics for a specific course"""
        # First get all courses
        courses_result = self.make_request("get", "courses")
        if not courses_result.get("success", False):
            return

        courses = courses_result
        if not courses:
            return


class ELearningSimulator:
    """Main simulator class that manages all users and activities"""

    def __init__(self, config_path: str = "config.yaml"):
        """Initialize the simulator with configuration"""
        self.config = self._load_config(config_path)
        self.api_url = self.config["api_url"]

        # User lists
        self.admins = []
        self.instructors = []
        self.students = []

        # Activity tracking
        self.active = True
        self.threads = {}

    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        try:
            with open(config_path, 'r') as file:
                config = yaml.safe_load(file)
                logger.info(f"Loaded configuration from {config_path}")
                return config
        except Exception as e:
            logger.error(f"Failed to load config from {config_path}: {e}")
            logger.info("Using default configuration")
            # Default configuration
            return {
                "api_url": "http://localhost:3000/api",
                "num_admins": 1,
                "num_instructors": 3,
                "num_students": 6,
                "course_topics": ["Web Development", "Data Science", "Machine Learning"],
                "content_types": ["video", "pdf", "quiz"],
                "user_passwords": {
                    "admin": "admin123",
                    "instructor": "instructor123",
                    "student": "student123"
                },
                "min_delay": 3,
                "max_delay": 8
            }

    def create_users(self):
        """Create all users based on configuration"""
        logger.info("Creating simulated users...")

        # Create admin users
        for i in range(self.config["num_admins"]):
            admin = Admin(
                name=f"Admin {i + 1}",
                email=f"admin{i + 1}@example.com",
                password=self.config["user_passwords"]["admin"],
                api_url=self.api_url
            )
            self.admins.append(admin)

        # Create instructor users
        for i in range(self.config["num_instructors"]):
            instructor = Instructor(
                name=f"Instructor {i + 1}",
                email=f"instructor{i + 1}@example.com",
                password=self.config["user_passwords"]["instructor"],
                api_url=self.api_url,
                course_topics=self.config["course_topics"],
                content_types=self.config["content_types"]
            )
            self.instructors.append(instructor)

        # Create student users
        for i in range(self.config["num_students"]):
            student = Student(
                name=f"Student {i + 1}",
                email=f"student{i + 1}@example.com",
                password=self.config["user_passwords"]["student"],
                api_url=self.api_url
            )
            self.students.append(student)

        logger.info(
            f"Created {len(self.admins)} admins, {len(self.instructors)} instructors, and {len(self.students)} students")

    def setup_users(self):
        """Register and login all users"""
        all_users = self.admins + self.instructors + self.students

        # Register users
        logger.info("Registering users...")
        for user in all_users:
            user.register()

        # Login users
        logger.info("Logging in users...")
        for user in all_users:
            user.login()

    def start_simulation(self):
        """Start the simulation with all users"""
        logger.info("Starting simulation...")
        self.active = True

        min_delay = self.config["min_delay"]
        max_delay = self.config["max_delay"]

        # Start threads for each user
        all_users = self.admins + self.instructors + self.students
        for user in all_users:
            thread = threading.Thread(
                target=user.behave,
                args=(min_delay, max_delay),
                daemon=True,
                name=f"{user.role}-{user.name}"
            )
            self.threads[user.name] = thread
            thread.start()

        # Start a summary thread
        summary_thread = threading.Thread(
            target=self._print_summary,
            daemon=True,
            name="summary"
        )
        self.threads["summary"] = summary_thread
        summary_thread.start()

        logger.info("Simulation running...")

    def _print_summary(self):
        """Print a summary of activity periodically"""
        while self.active:
            time.sleep(60)  # Every minute
            all_users = self.admins + self.instructors + self.students

            active_users = sum(1 for user in all_users if user.last_activity is not None)

            logger.info(f"--- ACTIVITY SUMMARY ---")
            logger.info(f"Active users: {active_users}/{len(all_users)}")
            logger.info(f"- Admins: {sum(1 for u in self.admins if u.last_activity is not None)}/{len(self.admins)}")
            logger.info(
                f"- Instructors: {sum(1 for u in self.instructors if u.last_activity is not None)}/{len(self.instructors)}")
            logger.info(
                f"- Students: {sum(1 for u in self.students if u.last_activity is not None)}/{len(self.students)}")
            logger.info(f"-----------------------")

    def stop_simulation(self):
        """Stop the simulation"""
        logger.info("Stopping simulation...")
        self.active = False

        # Stop all user behaviors
        all_users = self.admins + self.instructors + self.students
        for user in all_users:
            user.stop()

        # Wait for threads to finish
        for name, thread in self.threads.items():
            if thread.is_alive():
                logger.info(f"Waiting for thread {name} to finish...")
                thread.join(timeout=2)

        logger.info("Simulation stopped")


def main():
    """Main function to run the simulator"""
    try:
        logger.info("Starting E-Learning Platform Simulator")

        # Read config path from command line
        config_path = "config.yaml"
        if len(sys.argv) > 1:
            config_path = sys.argv[1]

        # Initialize and run simulator
        simulator = ELearningSimulator(config_path)

        # Create and setup users
        simulator.create_users()
        simulator.setup_users()

        # Start simulation
        simulator.start_simulation()

        # Keep the main thread running until interrupted
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Received keyboard interrupt, stopping simulation...")
            simulator.stop_simulation()

    except Exception as e:
        logger.error(f"Error in main function: {e}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())