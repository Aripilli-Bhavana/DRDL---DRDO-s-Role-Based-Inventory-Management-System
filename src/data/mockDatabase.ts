// Mock Database for DRDO Inventory Management System

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'division_personnel' | 'scientist';
  division: string;
}

interface InventoryItem {
  id: number;
  itemName: string;
  category: string;
  quantity: number;
  location: string;
  status: 'active' | 'maintenance' | 'retired';
  division: string;
  lastUpdated: string;
  addedBy: string;
  scientist: string;
  calibrationDate: string;
  calibrationStatus: 'current' | 'due' | 'overdue';
}

interface Request {
  id: number;
  scientistId: number;
  scientistName: string;
  itemRequested: string;
  quantity: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  division: string;
  requestDate: string;
}

// Mock users for divisions A to H
export const mockUsers: User[] = [
  { id: 1, name: "Aripilli Bhavana", email: "admin@drdo.gov.in", password: "admin123", role: "admin", division: "ADMIN" },
  { id: 2, name: "Rajesh Kumar", email: "divisionA@drdo.gov.in", password: "divA123", role: "division_personnel", division: "A" },
  { id: 10, name: "Dr. Ananya Gupta", email: "ananya.gupta@drdo.gov.in", password: "sci123", role: "scientist", division: "A" },
];

// Enhanced inventory with new fields
export const mockInventory: InventoryItem[] = [
  { id: 1, itemName: "NVIDIA RTX 4090 GPU", category: "Computing", quantity: 8, location: "Lab-A1", status: "active", division: "A", lastUpdated: "2024-01-15", addedBy: "Rajesh Kumar", scientist: "Dr. Ananya Gupta", calibrationDate: "2024-01-10", calibrationStatus: "current" },
  { id: 2, itemName: "Quantum Computer Module", category: "Computing", quantity: 2, location: "Lab-A1", status: "maintenance", division: "A", lastUpdated: "2024-01-10", addedBy: "Rajesh Kumar", scientist: "Dr. Ananya Gupta", calibrationDate: "2023-12-15", calibrationStatus: "overdue" },
];

// Mock requests
export const mockRequests: Request[] = [
  { id: 1, scientistId: 10, scientistName: "Dr. Ananya Gupta", itemRequested: "Additional GPU", quantity: 2, reason: "AI model training", status: "pending", division: "A", requestDate: "2024-01-22" },
];

export const mockActivityLogs = [
  { id: 1, action: "Added inventory", userName: "Rajesh Kumar", timestamp: "2024-01-22T10:30:00Z", division: "A", details: "Added NVIDIA RTX 4090 GPU" },
];

// Export functions
export const getDivisionStats = (division: string) => ({
  division,
  totalItems: 2, totalQuantity: 10, activeItems: 1, maintenanceItems: 1, overdueCalibrations: 1, dueCalibrations: 0
});

export const getAllDivisionStats = () => [
  { division: "A", totalItems: 2, totalQuantity: 10, activeItems: 1, maintenanceItems: 1, overdueCalibrations: 1, dueCalibrations: 0 },
  { division: "B", totalItems: 3, totalQuantity: 15, activeItems: 2, maintenanceItems: 1, overdueCalibrations: 0, dueCalibrations: 1 },
  { division: "C", totalItems: 1, totalQuantity: 5, activeItems: 1, maintenanceItems: 0, overdueCalibrations: 0, dueCalibrations: 0 },
  { division: "D", totalItems: 4, totalQuantity: 20, activeItems: 3, maintenanceItems: 1, overdueCalibrations: 0, dueCalibrations: 1 }
];
export const getInventoryByDivision = (division: string, userRole?: string) => mockInventory;
export const getActivityLogsByDivision = (division: string, userRole?: string) => mockActivityLogs;
export const getRequestsByDivision = (division: string, userRole?: string) => mockRequests;
export const getUsersByDivision = (division: string) => mockUsers;
export const authenticateUser = (email: string, password: string): User | null => 
  mockUsers.find(user => user.email === email && user.password === password) || null;