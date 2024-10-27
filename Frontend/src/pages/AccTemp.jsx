import React, { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Icon,
  Input,
  Divider,
  List,
  ListItem,
  Avatar,
  Heading,
  Stack,
  useColorModeValue,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormHelperText,
  Input as ChakraInput,
  Select,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import { FaUserEdit, FaSignOutAlt, FaCalendarAlt, FaMapMarkerAlt, FaLanguage, FaEnvelope, FaCreditCard, FaLock } from 'react-icons/fa';

function Account() {
  // Managing state for active section, profile picture, password modal, card details modal, and form data
  const [activePage, setActivePage] = useState('profile'); // Tracks if we're on profile or progress page
  const [profilePicture, setProfilePicture] = useState('https://via.placeholder.com/80');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isCardDetailsOpen, setIsCardDetailsOpen] = useState(false);
  const [editing, setEditing] = useState(null); // track currently editing field
  const [formData, setFormData] = useState({
    name: 'Firstname Lastname',
    dob: '07 July 2005',
    address: 'Give your address here',
    language: 'English',
    email: 'ikakodesign@gmail.com',
  });

  const [unitsProgress] = useState([
    { unit: 'Unit 01', progress: 80, marks: 85 },
    { unit: 'Unit 02', progress: 50, marks: 78 },
    { unit: 'Unit 03', progress: 90, marks: 90 },
    { unit: 'Unit 04', progress: 40, marks: 65 },
    { unit: 'Unit 05', progress: 50, marks: 70 },
    { unit: 'Unit 06', progress: 70, marks: 88 },
    { unit: 'Unit 07', progress: 30, marks: 50 },
    { unit: 'Unit 08', progress: 60, marks: 75 },
    { unit: 'Unit 09', progress: 100, marks: 95 },
    { unit: 'Unit 10', progress: 55, marks: 68 },
  ]);
  
  const overallGrade = 85; // This can be dynamically calculated based on units' marks

  // Functions for handling state
  const handleEditClick = (field) => {
    setEditing(field);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setEditing(null);
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleOpenChangePassword = () => setIsChangePasswordOpen(true);
  const handleCloseChangePassword = () => setIsChangePasswordOpen(false);

  const handleOpenCardDetails = () => setIsCardDetailsOpen(true);
  const handleCloseCardDetails = () => setIsCardDetailsOpen(false);

  return (


    <Box bg={useColorModeValue('gray.300', 'gray.800')} minH="100vh" p={6}>
      {/* Navbar */}
      <Box mb={8}>
        <Text fontSize="2xl" fontWeight="bold" color="blue.700">My Account</Text>
      </Box>

  
      
      <HStack align="flex-start" spacing={6}>
        {/* Sidebar */}
        <VStack
          spacing={4}
          p={6}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow="lg"
          rounded="lg"
          w="300px"
        >
          {/* User's Profile Picture */}
          <Avatar size="xl" src={profilePicture} mb={4} />
          <Input
            type="file"
            id="profile-picture-upload"
            accept="image/*"
            display="none"
            onChange={handleProfilePictureChange}
          />
          {/* Button to upload a new profile picture */}
          <Button
            onClick={() => document.getElementById('profile-picture-upload').click()}
            variant="outline"
            colorScheme="blue"
          >
            Change Profile Picture
          </Button>
          <Heading size="md">{formData.name}</Heading>
          <Text color="gray.500">{formData.email}</Text>

          <Divider />

          {/* Sidebar Navigation Links */}
          <List spacing={4} textAlign="left" w="full">
            <ListItem fontWeight={activePage === 'profile' ? "bold" : "normal"}>
              <Link onClick={() => setActivePage('profile')}>My Profile</Link>
            </ListItem>
            <ListItem fontWeight={activePage === 'progress' ? "bold" : "normal"}>
              <Link onClick={() => setActivePage('progress')}>My Progress</Link>
            </ListItem>
            <ListItem>
              <Link onClick={handleOpenCardDetails}>Billing & Payments</Link>
            </ListItem>
            <ListItem>
              <Link onClick={handleOpenChangePassword}>Change Password</Link>
            </ListItem>
          </List>
        </VStack>

        {/* Content Area - Switch between My Profile and My Progress */}
        {activePage === 'profile' ? (
          <Box
            flex={1}
            p={6}
            bg={useColorModeValue('white', 'gray.700')}
            boxShadow="lg"
            rounded="lg"
          >
            {/* Header and Sign Out Button */}
            <HStack justify="space-between" mb={6}>
              <Heading size="lg">My Profile</Heading>
              <Button leftIcon={<FaSignOutAlt />} colorScheme="red">
                Sign Out
              </Button>
            </HStack>

            {/* Introductory Text */}
            <Text mb={6}>
              Manage your personal information, including phone numbers and email addresses where you can be contacted.
            </Text>

            {/* List of Editable Profile Fields */}
            <Stack spacing={4}>
              <ProfileCard
                icon={FaUserEdit}
                title="Name"
                description={formData.name}
                type="text"
                isEditing={editing === 'name'}
                onEditClick={() => handleEditClick('name')}
                onSave={handleSave}
                onChange={handleInputChange}
              />
              <ProfileCard
                icon={FaCalendarAlt}
                title="Date of Birth"
                description={formData.dob}
                type="date"
                isEditing={editing === 'dob'}
                onEditClick={() => handleEditClick('dob')}
                onSave={handleSave}
                onChange={handleInputChange}
              />
              <ProfileCard
                icon={FaMapMarkerAlt}
                title="Address"
                description={formData.address}
                type="address"
                isEditing={editing === 'address'}
                onEditClick={() => handleEditClick('address')}
                onSave={handleSave}
                onChange={handleInputChange}
              />
              <ProfileCard
                icon={FaLanguage}
                title="Language"
                description={formData.language}
                type="dropdown"
                isEditing={editing === 'language'}
                onEditClick={() => handleEditClick('language')}
                onSave={handleSave}
                onChange={handleInputChange}
              />
              <ProfileCard
                icon={FaEnvelope}
                title="Contactable at"
                description={formData.email}
                type="email"
                isEditing={editing === 'email'}
                onEditClick={() => handleEditClick('email')}
                onSave={handleSave}
                onChange={handleInputChange}
              />
            </Stack>
          </Box>
        ) : (
          <Box
            flex={1}
            p={6}
            bg={useColorModeValue('white', 'gray.700')}
            boxShadow="lg"
            rounded="lg"
          >
            <Heading size="lg" mb={6}>My Progress</Heading>

            <Box mb={6} p={6} bg={useColorModeValue('white', 'gray.700')} boxShadow="lg" rounded="lg">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="xl" fontWeight="bold">Overall Grade</Text>
                <Box
                  borderWidth="1px"
                  borderRadius="lg"
                  p={4}
                  bg={useColorModeValue('blue.100', 'blue.900')}
                >
                  <Text fontSize="2xl">{overallGrade}%</Text>
                </Box>
              </HStack>
            </Box>

            {/* Units Progress */}
            <Stack spacing={6}>
              {unitsProgress.map((unit, index) => (
                <Box key={index} p={6} bg={useColorModeValue('gray.100', 'gray.800')} boxShadow="lg" rounded="lg">
                  <Heading size="md" mb={4}>{unit.unit}</Heading>
                  <HStack spacing={4} align="center">
                    <CircularProgress value={unit.progress} color="blue.400" size="80px">
                      <CircularProgressLabel>{unit.progress}%</CircularProgressLabel>
                    </CircularProgress>
                    <Text fontSize="xl" fontWeight="bold">
                      Marks: {unit.marks}%
                    </Text>
                  </HStack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </HStack>

      {/* Modal for changing password */}
      <Modal isOpen={isChangePasswordOpen} onClose={handleCloseChangePassword}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Current Password</FormLabel>
              <ChakraInput type="password" placeholder="Enter current password" />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>New Password</FormLabel>
              <ChakraInput type="password" placeholder="Enter new password" />
              <FormHelperText>Make sure your new password is strong.</FormHelperText>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Confirm New Password</FormLabel>
              <ChakraInput type="password" placeholder="Confirm new password" />
            </FormControl>
            <Button colorScheme="blue" mt={4} onClick={handleCloseChangePassword}>
              Save
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal for card details */}
      <Modal isOpen={isCardDetailsOpen} onClose={handleCloseCardDetails}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Billing & Payments</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Card Number</FormLabel>
              <ChakraInput type="text" placeholder="Enter card number" />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Expiration Date</FormLabel>
              <ChakraInput type="text" placeholder="MM/YY" />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>CVV</FormLabel>
              <ChakraInput type="text" placeholder="Enter CVV" />
            </FormControl>
            <Button colorScheme="blue" mt={4} onClick={handleCloseCardDetails}>
              Save
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

// Reusable Profile Card Component
function ProfileCard({ icon, title, description, type, isEditing, onEditClick, onSave, onChange }) {
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg={useColorModeValue('gray.50', 'gray.700')} boxShadow="sm">
      <HStack justify="space-between" align="center">
        <HStack spacing={4} align="center">
          <Icon as={icon} w={6} h={6} color="blue.500" />
          <VStack align="flex-start" spacing={0}>
            <Text fontSize="lg" fontWeight="bold">{title}</Text>
            {isEditing ? (
              <Input
                name={title.toLowerCase()}
                type={type === 'dropdown' ? 'text' : type}
                placeholder={title.toLowerCase()}
                onChange={onChange}
              />
            ) : (
              <Text>{description}</Text>
            )}
          </VStack>
        </HStack>
        {isEditing ? (
          <Button colorScheme="blue" onClick={onSave}>Save</Button>
        ) : (
          <Button variant="outline" onClick={onEditClick}>Edit</Button>
        )}
      </HStack>
    </Box>
    
  );
}

export default Account;