
from db.models import User, ChatThread, Message , Unit , Question , SampleAnswer, QuestionMarks, UnitMarks, FinalGrade,Subject
from db.database import get_session
from datetime import datetime
from sqlalchemy import func


def get_userID(email):
    session = get_session()
    try:
        user = session.query(User).filter_by(email=email).first()
        if user:
            return user.id
        else:
            return None
    except Exception as e:
        print(e)
    finally:
        session.close()

def get_user(email):
    session = get_session()
    try:
        user = session.query(User).filter_by(email=email).first()
        if user:
            return user
        else:
            return None
    except Exception as e:
        print(e)
    finally:
        session.close()



def get_user_threads(user_email):
    """
    Retrieve all chat threads associated with a user's email.
    
    :param user_email: The email of the user whose threads are being fetched.
    :return: A list of dictionaries representing the threads.
    """
    session = get_session()
    try:
        user = session.query(User).filter_by(email=user_email).first()
        if not user:
            return []

        threads = session.query(ChatThread).filter_by(user_id=user.id).all()

        return [
            {
                'id': thread.id,
                'title': f"Chat created at {thread.created_at}" if thread.thread_title is None else thread.thread_title,
                'created_at': thread.created_at
            } for thread in threads
        ]
    finally:
        session.close()

def get_thread_messages(thread_id, user_email):
    """
    Retrieve all messages for a specific thread, ensuring the user owns the thread.
    
    :param thread_id: The ID of the thread whose messages are being fetched.
    :param user_email: The email of the user who owns the thread.
    :return: A list of dictionaries representing the messages.
    """
    session = get_session()
    try:
        user = session.query(User).filter_by(email=user_email).first()
        if not user:
            return []

        # Ensure the thread belongs to the user
        thread = session.query(ChatThread).filter_by(id=thread_id, user_id=user.id).first()
        if not thread:
            return []

        messages = session.query(Message).filter_by(thread_id=thread.id).all()
        return [
            {
                'id': message.id,
                'content': message.message_content,
                'type': message.message_type,
                'timestamp': message.timestamp
            } for message in messages
        ]
    finally:
        session.close()

# Function to get questions for a given unit
def get_questions_by_unit(unit_id: int):
    """
    Fetch questions for a specific unit from the database.
    
    :param unit_id: The ID of the unit for which questions need to be fetched.
    :return: A list of dictionaries, each containing question_no, question_text, and unit_no.
    """
    session = get_session()
    try:
        questions = session.query(Question).filter_by(unit_id=unit_id).all()

        if not questions:
            return []

        # Format the response data
        question_list = [
            {
                'question_id': question.id,
                'question_no': question.question_no,  # Assuming id is the question number
                'question_text': question.question_text,
                'unit_no': question.unit_id
            }
            for question in questions
        ]
        
        return question_list
    except Exception as e:
        print(e)
    finally:
        session.close()

# Function to get answers for a given question
def get_answers_by_question_id(question_id: int):
    """
    Fetch answers for a specific question from the database.
    
    :param question_id: The ID of the question for which answers need to be fetched.
    :return: A dictionary, containing answer_id and answer_text
    """
    session = get_session()
    try:
        answer_db = session.query(SampleAnswer).filter_by(question_id=question_id).first()  # Use `first()` instead of `all()`
        
        if not answer_db:
            return {}
        
        # Format the response data
        answer = {'answer_id': answer_db.id, 'answer_text': answer_db.answer_text}
        
        return answer
    except Exception as e:
        print(e)
    finally:
        session.close()

def update_question_marks(student_id: int, question_id: int, marks_obtained: int):
    """
    Updates or inserts marks for a specific question answered by the student.
    
    :param student_id: The ID of the student.
    :param question_id: The ID of the question.
    :param marks_obtained: The marks obtained by the student for this question.
    """
    session = get_session()
    try:
        question_marks = session.query(QuestionMarks).filter_by(student_id=student_id, question_id=question_id).first()

        if question_marks:
            # Update the marks if a record exists
            question_marks.marks_obtained = marks_obtained
        else:
            # Insert a new record if not already present
            new_question_marks = QuestionMarks(
                student_id=student_id,
                question_id=question_id,
                marks_obtained=marks_obtained
            )
            session.add(new_question_marks)

        session.commit()

    except Exception as e:
        print(f"Error updating question marks: {e}")
    finally:
        session.close()

# Function to update unit marks
def update_unit_marks(student_id: int, unit_id: int):
    """
    Updates the total marks obtained and the number of questions attempted 
    for a specific unit by a student.
    
    :param student_id: The ID of the student.
    :param unit_id: The ID of the unit.
    """
    session = get_session()
    try:
        # Calculate total marks obtained for the unit
        total_marks = session.query(func.sum(QuestionMarks.marks_obtained)).join(
            Question, Question.id == QuestionMarks.question_id
        ).filter(
            Question.unit_id == unit_id, 
            QuestionMarks.student_id == student_id
        ).scalar() or 0
        
        # Count the number of questions attempted by the student
        questions_attempted = session.query(func.count(QuestionMarks.id)).join(
            Question, Question.id == QuestionMarks.question_id
        ).filter(
            Question.unit_id == unit_id, 
            QuestionMarks.student_id == student_id
        ).scalar() or 0

        # Check if the unit marks already exist for the student
        unit_marks = session.query(UnitMarks).filter_by(student_id=student_id, unit_id=unit_id).first()

        if unit_marks:
            # Update the existing record with new totals
            unit_marks.total_marks_obtained = total_marks
            unit_marks.total_questions_attempted = questions_attempted
            unit_marks.timestamp = datetime.utcnow()  # Update the timestamp
        else:
            # Create a new record if it doesn't exist
            new_unit_marks = UnitMarks(
                student_id=student_id,
                unit_id=unit_id,
                total_marks_obtained=total_marks,
                total_questions_attempted=questions_attempted
            )
            session.add(new_unit_marks)

        session.commit()

    except Exception as e:
        print(f"Error updating unit marks: {e}")
        session.rollback()  # Rollback the session in case of an error
    finally:
        session.close()

# Function to calculate and update final grade (this can be used later after updating question/unit marks)
def update_final_grade(student_id: int, subject_id=1):
    """
    Update the final grade for a student in a specific subject based on their unit marks.
    
    :param student_id: The ID of the student.
    :param subject_id: The ID of the subject.
    :return: A dictionary with the overall marks and assigned grade.
    """
    session = get_session()
    try:
        # Retrieve unit marks for the given student and subject
        unit_marks_records = session.query(UnitMarks).filter_by(student_id=student_id).all()

        total_marks_obtained = 0
        total_questions_attempted = 0
        
        # Sum up the total marks and questions attempted
        for record in unit_marks_records:
            total_marks_obtained += record.total_marks_obtained
            total_questions_attempted += record.total_questions_attempted
        
        # Calculate the overall marks based on attempted questions
        overall_marks = 0
        if total_questions_attempted > 0:
            overall_marks = (total_marks_obtained / total_questions_attempted)  # Assuming the marks are out of 100
        
        # Determine the letter grade based on overall marks
        if overall_marks >= 75:
            grade = 'A'
        elif overall_marks >= 65:
            grade = 'B'
        elif overall_marks >= 50:
            grade = 'C'
        elif overall_marks >= 35:
            grade = 'S'
        else:
            grade = 'F'
        
        # Check if a final grade record already exists
        final_grade_record = session.query(FinalGrade).filter_by(student_id=student_id, subject_id=subject_id).first()

        if final_grade_record:
            # Update existing record
            final_grade_record.overall_marks = overall_marks
            final_grade_record.grade = grade
        else:
            # Create a new final grade record
            final_grade_record = FinalGrade(
                student_id=student_id,
                subject_id=subject_id,
                overall_marks=overall_marks,
                grade=grade
            )
            session.add(final_grade_record)

        # Commit the session to save changes
        session.commit()

        return {
            'overall_marks': overall_marks,
            'grade': grade
        }

    except Exception as e:
        print(e)
        session.rollback()
        return None
    finally:
        session.close()


def get_unit_marks(student_id: int):
    """
    Fetch all unit marks for a specific student.
    
    :param student_id: The ID of the student.
    :return: A list of UnitMarks objects for the specified student.
    """
    session = get_session()  # Get a new database session
    try:
        # Query to filter unit marks by student_id
        unit_marks = session.query(UnitMarks).filter_by(student_id=student_id).all()
        return unit_marks
    except Exception as e:
        print(f"Error fetching unit marks: {e}")
        return []  # Return an empty list in case of an error
    finally:
        session.close()  # Ensure the session is closed after the operation


def get_unit_name(unit_id: int):
    """
    Fetch the name of a unit by its ID.

    :param unit_id: The ID of the unit.
    :return: The name of the unit, or None if not found.
    """
    session = get_session()  # Get a new database session
    try:
        unit = session.query(Unit).filter_by(id=unit_id).first()  # Query for the unit
        if unit:
            return unit.unit_name # Return the unit's name
        return None  # Return None if unit not found
    except Exception as e:
        print(f"Error fetching unit name: {e}")
        return None  # Return None in case of an error
    finally:
        session.close()  # Ensure the session is closed after the operation

def get_unit_progress(unit_id, student_id):
    session = get_session()
    try:
        # Get the total number of questions for the given unit
        total_questions = session.query(Question).filter_by(unit_id=unit_id).count()
        
        # Get the student's attempted questions from UnitMarks, safely handling the case where no record exists
        unit_marks = session.query(UnitMarks).filter_by(unit_id=unit_id, student_id=student_id).first()

        total_questions_attempted = unit_marks.total_questions_attempted if unit_marks else 0

        # Calculate progress, handling the case where total_questions is 0 to avoid division by zero
        if total_questions:
            progress = (total_questions_attempted / total_questions) * 100
        else:
            progress = 0

        return round(progress,2)

    except Exception as e:
        # Log or print the error for debugging purposes
        print(f"Error occurred while fetching progress: {e}")
        return 0  # Return a default value in case of error

    finally:
        # Ensure the session is closed after the operation
        session.close()

    