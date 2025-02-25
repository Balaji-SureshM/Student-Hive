# Student Hive

Student Hive is a comprehensive learning platform designed to enhance the educational experience through collaboration, resource sharing, and AI-powered assistance. Our platform brings together students in a vibrant community where they can learn, share, and grow together.

## Core Features

### 1. Q&A System
- Post academic questions and get answers from peers
- Tag questions by subject for easy discovery
- AI-powered answer suggestions
- Mark helpful answers as accepted
- Search existing questions and answers

### 2. Study Materials
- Share and access study notes, documents, and resources
- AI-generated summaries of uploaded materials
- Organize materials by subject and topic
- Download resources for offline use
- Rate and review shared materials

### 3. AI Tutor
- Get personalized learning assistance
- Interactive problem-solving help
- Concept explanations with examples
- Progress tracking and recommendations
- 24/7 availability for learning support

### 4. Real-time Chat Rooms
- Connect with fellow students instantly
- Form study groups
- Share quick tips and help
- Topic-based discussion channels
- Build your academic community

### 5. Achievements System
- Track your learning progress
- Share academic accomplishments
- View peer achievements
- Earn recognition for helping others
- Monitor personal growth

### 6. User Profiles
- Customizable academic profiles
- Track contribution history
- Showcase achievements and expertise
- Connect with other students
- Build your academic network

## Technical Features

- Modern, responsive UI with light/dark mode support
- Secure user authentication
- AI-powered assistance throughout the platform
- Real-time notifications
- Mobile-friendly design

## Getting Started

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure Gemini AI:
- Get your API key from Google AI Studio (https://makersuite.google.com/)
- Add your API key to the `.env` file:
```
GEMINI_API_KEY=your_api_key_here
```

3. Initialize the database:
The database will be automatically created when you run the application for the first time.

4. Run the application:
```bash
python app.py
```

5. Access the platform at: http://localhost:5000

## Tech Stack

- Flask - Web framework
- SQLAlchemy - Database ORM
- Flask-Login - User authentication
- Google Gemini AI - AI-powered features
- Bootstrap - Frontend styling

## Project Structure

```
├── app.py              # Main application file
├── requirements.txt    # Python dependencies
├── .env               # Environment variables
├── static/            # Static files (CSS, JS)
│   └── style.css      # Custom styles
└── templates/         # HTML templates
    ├── base.html      # Base template
    ├── index.html     # Home page
    ├── login.html     # Login page
    ├── register.html  # Registration page
    └── various feature templates
```

## Support

For questions and support, please:
1. Check the existing Q&A section
2. Use the AI Guide Bot for immediate assistance
3. Join the community chat for real-time help

## Contributing

We welcome contributions to improve Student Hive! Please feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Share feedback

## License

This project is licensed under the MIT License - see the LICENSE file for details.
