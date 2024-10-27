import sys
import os

# Add the Backend1 directory (absolute path) to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db.models import User, ChatThread, Message , Unit , Question , SampleAnswer , Subject
from db.database import get_session
from datetime import datetime


def update_unit(unit_name, unit_description=None):
    """
    Update or create a Unit in the database.
    
    :param unit_name: The name of the unit to update or create.
    :param unit_description: An optional description for the unit.
    """
    session = get_session()
    try:
        # Check if the unit already exists
        unit = session.query(Unit).filter_by(unit_name=unit_name).first()
        
        if unit:
            # Update existing unit
            if unit_description is not None:
                unit.unit_description = unit_description
                session.commit()
                print(f"Updated unit: {unit_name}")
            else:
                print(f"No changes made to unit: {unit_name}")
        else:
            # Create new unit
            new_unit = Unit(unit_name=unit_name, unit_description=unit_description)
            session.add(new_unit)
            session.commit()
            print(f"Created new unit: {unit_name}")
    except Exception as e:
        session.rollback()  # Roll back the session in case of an error
        print(f"Error occurred: {e}")
    finally:
        session.close()


def update_question(unit_name, question_text,question_no, difficulty_level=None):
    """
    Update or create a question in the database.
    
    :param unit_name: The name of the unit the question belongs to.
    :param question_text: The text of the question.
    :param difficulty_level: Optional difficulty level for the question.
    """
    session = get_session()
    try:
        # Find the corresponding unit
        unit = session.query(Unit).filter_by(unit_name=unit_name).first()
        if not unit:
            print(f"Unit '{unit_name}' not found.")
            return
        
        # Check if the question already exists in that unit
        question = session.query(Question).filter_by(unit_id=unit.id, question_no=question_no).first()
        
        if question:
            # Update existing question
            if difficulty_level:
                question.difficulty_level = difficulty_level
            if question_no:
                question.question_no = question_no
                question.question_text = question_text
            question.updated_at = datetime.utcnow()
            session.commit()
            print(f"Updated question: '{question_text}' in unit: '{unit_name}'")
        else:
            # Create new question
            new_question = Question(
                unit_id=unit.id,
                question_text=question_text,
                question_no=question_no,
                difficulty_level=difficulty_level,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(new_question)
            session.commit()
            print(f"Created new question: '{question_text}' in unit: '{unit_name}'")
    
    except Exception as e:
        session.rollback()  # Rollback in case of an error
        print(f"Error occurred: {e}")
    
    finally:
        session.close()

def update_answer(question_no,unit_id, answer_text):
    """
    Update or create a sample answer for a question in the database.
    
    :param question_text: The text of the question the sample answer is for.
    :param answer_text: The text of the sample answer.
    """
    session = get_session()
    try:
        # Find the corresponding question
        question = session.query(Question).filter_by(question_no=question_no,unit_id=unit_id).first()
        if not question:
            print(f"Question with question no '{question_no}'and unit no '{unit_id}' not found.")
            return
        
        # Check if the sample answer already exists for that question
        sample_answer = session.query(SampleAnswer).filter_by(question_id=question.id).first()
        
        if sample_answer:
            # Update existing sample answer
            sample_answer.answer_text = answer_text
            sample_answer.updated_at = datetime.utcnow()
            session.commit()
            print(f"Updated sample answer for question with id: '{question.id}'")
        else:
            # Create new sample answer
            new_sample_answer = SampleAnswer(
                question_id=question.id,
                answer_text=answer_text,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(new_sample_answer)
            session.commit()
            print(f"Created new sample answer for question with id: '{question.id}'")
    
    except Exception as e:
        session.rollback()  # Rollback in case of an error
        print(f"Error occurred: {e}")
    
    finally:
        session.close()

def add_subject(name: str, description: str = None):
    """
    Add a new subject to the database.

    :param name: Name of the subject.
    :param description: Description of the subject (optional).
    :return: The created Subject object or None in case of an error.
    """
    session = get_session()
    try:
        new_subject = Subject(name=name, description=description)
        session.add(new_subject)
        session.commit()
       # return new_subject
    except Exception as e:
        print(e)
        session.rollback()
        return None
    finally:
        session.close()

def get_subjects():
    """
    Retrieve all subjects from the database.

    :return: A list of dictionaries representing subjects.
    """
    session = get_session()
    try:
        subjects = session.query(Subject).all()
        return [{'id': subject.id, 'name': subject.name, 'description': subject.description} for subject in subjects]
    except Exception as e:
        print(e)
        return []
    finally:
        session.close()

