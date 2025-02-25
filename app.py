from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, TextAreaField, FileField
from wtforms.fields import EmailField
from wtforms.validators import DataRequired, Email, Length, EqualTo, ValidationError
import google.generativeai as genai
from datetime import datetime
import os
from dotenv import load_dotenv
from googleapiclient.discovery import build
from bs4 import BeautifulSoup
import requests
import json
import hashlib

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-please-change-in-production')
app.config['SITE_NAME'] = 'Student Hive'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///forum.db'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx', 'xls', 'xlsx'}

# Create uploads directory if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Configure Gemini AI
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

# Configure YouTube API
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')
youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

def search_youtube_videos(query, max_results=3):
    """Search for YouTube videos related to the query."""
    try:
        # Call the search.list method to retrieve results
        search_response = youtube.search().list(
            q=query,
            part='snippet',
            maxResults=max_results,
            type='video',
            relevanceLanguage='en',
            safeSearch='strict'
        ).execute()

        videos = []
        for item in search_response.get('items', []):
            video = {
                'title': item['snippet']['title'],
                'url': f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                'thumbnail': item['snippet']['thumbnails']['default']['url']
            }
            videos.append(video)
        return videos
    except Exception as e:
        print(f"YouTube search failed: {str(e)}")
        return []

def search_web_resources(query, max_results=4):
    """Search for relevant web resources using DuckDuckGo."""
    try:
        # Use DuckDuckGo's HTML search
        headers = {'User-Agent': 'Mozilla/5.0'}
        search_url = f"https://html.duckduckgo.com/html/?q={query}+tutorial+documentation"
        response = requests.get(search_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        results = []
        links = soup.find_all('a', {'class': 'result__a'})
        
        for link in links[:max_results]:
            title = link.text.strip()
            url = link['href']
            if not any(excluded in url.lower() for excluded in ['youtube.com', 'facebook.com', 'twitter.com']):
                results.append({
                    'title': title,
                    'url': url
                })
        
        return results
    except Exception as e:
        print(f"Web search failed: {str(e)}")
        return []

def get_learning_resources(query):
    """Get both YouTube videos and web resources."""
    videos = search_youtube_videos(query)
    resources = search_web_resources(query)
    
    # Format the results as markdown links
    markdown_links = []
    
    # Add web resources
    if resources:
        markdown_links.append("### Documentation & Tutorials")
        for resource in resources:
            markdown_links.append(f"- [{resource['title']}]({resource['url']})")
    
    # Add YouTube videos
    if videos:
        if markdown_links:  # Add a newline if we have web resources
            markdown_links.append("")
        markdown_links.append("### Video Tutorials")
        for video in videos:
            markdown_links.append(f"- [{video['title']}]({video['url']})")
    
    return "\n".join(markdown_links) if markdown_links else None

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    questions = db.relationship('Question', backref='author', lazy=True)
    answers = db.relationship('Answer', backref='author', lazy=True)
    achievements = db.relationship('Achievement', backref='user', lazy=True)
    materials = db.relationship('StudyMaterial', backref='author', lazy=True)
    projects = db.relationship('Project', backref='author', lazy=True)
    chat_messages = db.relationship('ChatMessage', backref='author', lazy=True)
    achievement_comments = db.relationship('AchievementComment', backref='author', lazy=True)
    tutor_sessions = db.relationship('TutorSession', backref='student', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

class StudyMaterial(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    ai_summary = db.Column(db.Text)
    filename = db.Column(db.String(255), nullable=True)
    file_path = db.Column(db.String(500), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    comments = db.relationship('AchievementComment', backref='achievement', lazy=True)

class AchievementComment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievement.id'), nullable=False)
    user = db.relationship('User', backref='achievement_user_comments', lazy=True)

class TutorSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='active')  # active, completed
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    messages = db.relationship('TutorMessage', backref='session', lazy=True)

class TutorMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    is_ai = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    session_id = db.Column(db.Integer, db.ForeignKey('tutor_session.id'), nullable=False)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    answers = db.relationship('Answer', backref='question', lazy=True)

class Answer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_ai = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    ai_description = db.Column(db.Text)
    repository_link = db.Column(db.String(500), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Form Classes
class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=20)])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Sign In')

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=20)])
    email = EmailField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Create Account')

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('Username already exists. Please choose a different one.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('Email already registered. Please use a different one.')

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Add MD5 filter for Jinja2
@app.template_filter('md5')
def md5_filter(s):
    """Convert a string to its MD5 hash for Gravatar URLs"""
    if not s:
        return ''
    return hashlib.md5(s.lower().encode()).hexdigest()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/questions')
def questions():
    questions = Question.query.order_by(Question.timestamp.desc()).all()
    return render_template('questions.html', questions=questions)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(
            username=form.username.data,
            email=form.email.data
        )
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            flash('Successfully logged in!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('index'))
        else:
            flash('Invalid username or password.', 'danger')
    
    return render_template('login.html', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/ask', methods=['GET', 'POST'])
@login_required
def ask_question():
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        question = Question(title=title, content=content, author=current_user)
        db.session.add(question)
        db.session.commit()
        
        # Generate AI response with enhanced prompt and error handling
        try:
            prompt = f"""Question: {title}

Detailed Question: {content}

Please provide a comprehensive and helpful answer to this question. Include relevant examples or explanations where appropriate."""
            
            ai_response = model.generate_content(prompt).text
            ai_answer = Answer(
                content=ai_response, 
                is_ai=True,
                author=User.query.first() or current_user,  # Fallback to current user if no system user
                question=question
            )
            db.session.add(ai_answer)
            db.session.commit()
        except Exception as e:
            flash('AI response could not be generated at the moment. Your question has been posted and will receive peer answers.')
            print(f"AI response generation failed: {str(e)}")
            
        return redirect(url_for('view_question', question_id=question.id))
    return render_template('ask_question.html')

@app.route('/question/<int:question_id>')
def view_question(question_id):
    question = Question.query.get_or_404(question_id)
    return render_template('question.html', question=question)

@app.route('/question/<int:question_id>/answer', methods=['POST'])
@login_required
def post_answer(question_id):
    content = request.form['content']
    question = Question.query.get_or_404(question_id)
    answer = Answer(content=content, author=current_user, question=question)
    db.session.add(answer)
    db.session.commit()
    return redirect(url_for('view_question', question_id=question_id))

@app.route('/study-materials')
def study_materials():
    search_query = request.args.get('q', '').strip()
    if search_query:
        # Search in title and description
        materials = StudyMaterial.query.filter(
            db.or_(
                StudyMaterial.title.ilike(f'%{search_query}%'),
                StudyMaterial.description.ilike(f'%{search_query}%')
            )
        ).order_by(StudyMaterial.timestamp.desc()).all()

        # If no materials found, get learning resources
        if not materials:
            try:
                ai_recommendations = get_learning_resources(search_query)
            except Exception as e:
                ai_recommendations = "Sorry, I couldn't find any resources at this time."
                print(f"Resource search failed: {str(e)}")
        else:
            ai_recommendations = None
    else:
        materials = StudyMaterial.query.order_by(StudyMaterial.timestamp.desc()).all()
        ai_recommendations = None

    return render_template('study_materials.html', 
                         materials=materials,
                         search_query=search_query,
                         ai_recommendations=ai_recommendations)

class UploadMaterialForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired()])
    description = TextAreaField('Description', validators=[DataRequired()])
    file = FileField('File', validators=[DataRequired()])
    submit = SubmitField('Upload Material')

@app.route('/upload-material', methods=['GET', 'POST'])
@login_required
def upload_material():
    form = UploadMaterialForm()
    if form.validate_on_submit():
        file = form.file.data
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Generate AI summary
            try:
                content_prompt = f"""Study Material: {form.title.data}
                Description: {form.description.data}
                
Please generate a comprehensive summary that:
1. Outlines the key topics covered
2. Highlights important concepts
3. Suggests how students can best use this material
4. Lists potential learning outcomes

Use a professional and engaging tone."""
                
                ai_summary = model.generate_content(content_prompt).text
            except Exception as e:
                ai_summary = "AI summary could not be generated at this time."
                print(f"AI summary generation failed: {str(e)}")
            
            # Save file and create database entry
            file.save(file_path)
            material = StudyMaterial(
                title=form.title.data,
                description=form.description.data,
                ai_summary=ai_summary,
                filename=filename,
                file_path=file_path,
                author=current_user
            )
            db.session.add(material)
            db.session.commit()
            flash('Study material uploaded successfully!', 'success')
            return redirect(url_for('view_material', material_id=material.id))
        else:
            flash('Invalid file type. Allowed files are: pdf, doc, docx, txt, ppt, pptx, xls, xlsx', 'error')
    
    return render_template('upload_material.html', form=form)

@app.route('/study-materials/<int:material_id>')
def view_material(material_id):
    material = StudyMaterial.query.get_or_404(material_id)
    return render_template('view_material.html', material=material)

@app.route('/download/<int:material_id>')
def download_material(material_id):
    material = StudyMaterial.query.get_or_404(material_id)
    return send_from_directory(
        app.config['UPLOAD_FOLDER'],
        material.filename,
        as_attachment=True
    )

@app.route('/chat')
@login_required
def chat():
    messages = ChatMessage.query.order_by(ChatMessage.timestamp.desc()).limit(50).all()
    return render_template('chat.html', messages=messages)

@app.route('/send_message', methods=['POST'])
@login_required
def send_message():
    content = request.form.get('content', '').strip()
    if content:
        message = ChatMessage(content=content, user_id=current_user.id)
        db.session.add(message)
        try:
            db.session.commit()
            return jsonify({'status': 'success'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'status': 'error', 'message': str(e)}), 500
    return jsonify({'status': 'error', 'message': 'Message cannot be empty'}), 400

@app.route('/achievements')
def achievements():
    achievements = Achievement.query.order_by(Achievement.timestamp.desc()).all()
    return render_template('achievements.html', achievements=achievements)

@app.route('/achievements/share', methods=['GET', 'POST'])
@login_required
def share_achievement():
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        achievement = Achievement(title=title, description=description, user_id=current_user.id)
        db.session.add(achievement)
        db.session.commit()
        return redirect(url_for('achievements'))
    return render_template('share_achievement.html')

@app.route('/achievements/<int:achievement_id>')
def view_achievement(achievement_id):
    achievement = Achievement.query.get_or_404(achievement_id)
    return render_template('view_achievement.html', achievement=achievement)

@app.route('/achievements/<int:achievement_id>/comment', methods=['POST'])
@login_required
def comment_achievement(achievement_id):
    achievement = Achievement.query.get_or_404(achievement_id)
    content = request.form['content']
    comment = AchievementComment(content=content, author=current_user, achievement=achievement)
    db.session.add(comment)
    db.session.commit()
    return redirect(url_for('view_achievement', achievement_id=achievement_id))

@app.route('/ai-tutor')
@login_required
def ai_tutor():
    sessions = TutorSession.query.filter_by(user_id=current_user.id).order_by(TutorSession.timestamp.desc()).all()
    return render_template('ai_tutor.html', sessions=sessions)

@app.route('/ai-tutor/new', methods=['GET', 'POST'])
@login_required
def new_tutor_session():
    if request.method == 'POST':
        topic = request.form['topic']
        content = request.form['content']
        session = TutorSession(topic=topic, content=content, student=current_user)
        db.session.add(session)
        db.session.commit()
        
        # Generate initial AI response
        try:
            prompt = f"""Topic: {topic}
Student Question: {content}

As an AI tutor, please provide a helpful and educational response that will guide the student's learning. Include explanations, examples, and follow-up questions where appropriate."""
            
            ai_response = model.generate_content(prompt).text
            message = TutorMessage(content=ai_response, is_ai=True, session=session)
            db.session.add(message)
            db.session.commit()
        except Exception as e:
            print(f"AI tutor response generation failed: {str(e)}")
        
        return redirect(url_for('view_tutor_session', session_id=session.id))
    return render_template('new_tutor_session.html')

@app.route('/ai-tutor/session/<int:session_id>')
@login_required
def view_tutor_session(session_id):
    session = TutorSession.query.get_or_404(session_id)
    if session.user_id != current_user.id:
        abort(403)
    return render_template('view_tutor_session.html', session=session)

@app.route('/ai-tutor/session/<int:session_id>/message', methods=['POST'])
@login_required
def send_tutor_message(session_id):
    session = TutorSession.query.get_or_404(session_id)
    if session.user_id != current_user.id:
        abort(403)
    
    content = request.form['content']
    user_message = TutorMessage(content=content, is_ai=False, session=session)
    db.session.add(user_message)
    db.session.commit()
    
    # Generate AI tutor response
    try:
        prompt = f"""Previous conversation context: 
{session.topic}

Student's latest message: {content}

As an AI tutor, please provide a helpful and educational response that will guide the student's learning. Include explanations, examples, and follow-up questions where appropriate."""
        
        ai_response = model.generate_content(prompt).text
        ai_message = TutorMessage(content=ai_response, is_ai=True, session=session)
        db.session.add(ai_message)
        db.session.commit()
    except Exception as e:
        print(f"AI tutor response generation failed: {str(e)}")
    
    return redirect(url_for('view_tutor_session', session_id=session_id))

@app.route('/projects')
def projects():
    projects = Project.query.order_by(Project.timestamp.desc()).all()
    return render_template('projects.html', projects=projects)

@app.route('/projects/new', methods=['GET', 'POST'])
@login_required
def new_project():
    if request.method == 'POST':
        # Handle JSON requests for description generation
        if request.is_json:
            data = request.get_json()
            if data.get('generate_only'):
                try:
                    prompt = f"""Project Title: {data['title']}
                    
Please write a comprehensive project description that covers:
1. What the project does
2. Key features and functionalities
3. Technical aspects
4. Potential applications or use cases

Use a professional and engaging tone."""
                    
                    ai_description = model.generate_content(prompt).text
                    return jsonify({'description': ai_description})
                except Exception as e:
                    return jsonify({'error': str(e)}), 500
        
        # Handle form submission
        title = request.form['title']
        description = request.form.get('description', '')
        repository_link = request.form['repository_link']
        
        # Generate AI description
        try:
            prompt = f"""Project Title: {title}
            
Please write a comprehensive project description that covers:
1. What the project does
2. Key features and functionalities
3. Technical aspects
4. Potential applications or use cases

Use a professional and engaging tone."""
            
            ai_description = model.generate_content(prompt).text
        except Exception as e:
            ai_description = "AI description could not be generated at this time."
            print(f"AI description generation failed: {str(e)}")
        
        # Use user's description if provided, otherwise use AI description
        final_description = description if description.strip() else ai_description
        
        project = Project(
            title=title,
            description=final_description,
            ai_description=ai_description,
            repository_link=repository_link,
            author=current_user
        )
        db.session.add(project)
        db.session.commit()
        return redirect(url_for('view_project', project_id=project.id))
    return render_template('new_project.html')

@app.route('/projects/<int:project_id>')
def view_project(project_id):
    project = Project.query.get_or_404(project_id)
    return render_template('view_project.html', project=project)

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html', user=current_user)

if __name__ == '__main__':
    with app.app_context():
        # Check if we need to add new columns
        inspector = db.inspect(db.engine)
        study_material_columns = [col['name'] for col in inspector.get_columns('study_material')]
        
        # Create all tables first
        db.create_all()
        
        # Add new columns if they don't exist
        with db.engine.connect() as conn:
            if 'filename' not in study_material_columns:
                conn.execute(db.text('ALTER TABLE study_material ADD COLUMN filename VARCHAR(255)'))
            if 'file_path' not in study_material_columns:
                conn.execute(db.text('ALTER TABLE study_material ADD COLUMN file_path VARCHAR(500)'))
            if 'content' in study_material_columns:
                # Remove the old content column as it's no longer needed
                conn.execute(db.text('ALTER TABLE study_material DROP COLUMN content'))
            conn.commit()
            
        print("Database schema updated successfully!")
    app.run(debug=True)
