import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Heading, Text, CardFooter, Button, Textarea, Box } from '@chakra-ui/react';
import ChatModal from './ChatModal'; // Import the ChatModal component
import apiServices from '../services/apiServices';
import MarkdownRenderer from './MarkdownRenderer';

function qUnitText({ question, UnitNo, QuestionNo, QuestionID }) {
  const [answer, setAnswer] = useState('');
  const [marks, setMarks] = useState(null);
  const [submit, setSubmit] = useState(false);
  const [isEditing, setIsEditing] = useState(true); // Initially editable
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const handleAnswerChange = (e) => {
    setAnswer(e.target.value);
  };

  const handleSubmit = () => {
 
    setIsEditing(false); // Disable editing after submission
    apiServices.post('/grade', { student_answer: answer, question: question , unit_no: UnitNo, question_no: QuestionNo, question_id: QuestionID })
      .then(response => {
        setMarks(response.data.score);
        setMessage(response.data.message);
        setSubmit(true);

      })
      .catch(error => {
        setError(error.response?.data?.error || "An error occurred");
      });
  };

  // Handle key press (submit on Enter)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Prevent 'Shift + Enter' from triggering submit (for multi-line input)
      e.preventDefault(); // Prevents default behavior (line break)
      handleSubmit();
    }
  };

  // Re-enable editing on click
  const handleEnableEdit = () => {
    setIsEditing(true);
  };

  return (
    <>
      <Card border="1px solid" borderColor="gray.200" bg="gray.400">
        <CardHeader>
          <Heading size="md" borderBottom="1px solid black" pb={2}>
            {typeof question === 'string' && question.includes('<')
              ? <Text fontSize="lg" mb={4} dangerouslySetInnerHTML={{ __html: question }} />
              : <Text fontSize="lg" mb={4}>{question}</Text>}
          </Heading>
        </CardHeader>

        <CardBody>
          {/* Bind the Textarea to the answer state */}
          <Textarea
            placeholder="Type your answer here..."
            _placeholder={{ color: 'gray.800' }}
            color="black"
            size="md"
            resize="none"
            value={answer}
            onChange={handleAnswerChange}
            onKeyDown={handleKeyDown} // Trigger submit on Enter key
            focusBorderColor='blue.800'
            readOnly={!isEditing} // Set to read-only when not editing
            onClick={handleEnableEdit} // Enable editing on click
            cursor={isEditing ? 'text' : 'pointer'} // Show text cursor when editing, pointer when not
          />
        </CardBody>

        <CardFooter ml="auto" display="flex" justifyContent="flex-end" gap={2}>
          <Button colorScheme="blue" bg="blue.400" borderRadius="5px" color="white" onClick={handleSubmit} isDisabled={!isEditing}>
            Submit
          </Button>

          <ChatModal question={question} answer={answer} unit_no={UnitNo} question_no={QuestionNo} question_id={QuestionID} />
        </CardFooter>
      </Card>

      {submit && marks >= 60 ? (
        <Box bg="green.700" w="100%" p={4} color="white" borderColor="green">
          Your Score: {marks} <br />
          Explanation for your score:
          <MarkdownRenderer content={message} />
        </Box>
      ) : submit && marks >= 30 ? (
        <Box bg="orange.400" w="100%" p={4} color="white" borderColor="orange.200">
          Your Score: {marks} <br />
          Explanation for your score:
          <MarkdownRenderer content={message} />
        </Box>
      ) : submit && (
        <Box bg="red.400" w="100%" p={4} color="white" borderColor="red">
          Your Score: {marks} <br />
          Explanation for your score:
          <MarkdownRenderer content={message} />
        </Box>
      )}

      {error && (
        <Box bg="red.400" w="100%" p={4} color="white" borderColor="red">
          Error: {error}
        </Box>
      )}
    </>
  );
}

export default qUnitText;
