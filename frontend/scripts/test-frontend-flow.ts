import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

let token: string | null = null;

api.interceptors.request.use((config) => {
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, data?: unknown) {
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name}`, data ?? '');
    failed++;
  }
}

async function runFrontendFlow() {
  console.log('\n========================================');
  console.log('SIMULATING COMPLETE FRONTEND USER FLOW');
  console.log('========================================\n');

  const ts = Date.now();
  const testUser = {
    name: 'Frontend Test User',
    email: `fe_user_${ts}@example.com`,
    password: 'password123'
  };

  // 1. Register
  console.log('--- 1. Register Flow ---');
  const regRes = await api.post('/auth/register', testUser);
  assert(regRes.status === 201 && !!regRes.data.data?.token, 'Register creates user & returns JWT');
  assert(!('password' in (regRes.data.data?.user || {})), 'Password is not returned');

  // 2. Login
  console.log('\n--- 2. Login Flow ---');
  const loginRes = await api.post('/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  assert(loginRes.status === 200 && !!loginRes.data.data?.token, 'Login validates credentials & sets JWT');
  token = loginRes.data.data?.token;
  const userId = loginRes.data.data?.user?._id;

  // 3. Dashboard: Fetch Boards (empty state)
  console.log('\n--- 3. Dashboard: Empty State ---');
  const emptyBoardsRes = await api.get('/boards');
  assert(emptyBoardsRes.data.data?.boards?.length === 0, 'Dashboard initial state: 0 boards (shows empty state)');

  // 4. Create Board
  console.log('\n--- 4. Dashboard: Create Board ---');
  const createBoardRes = await api.post('/boards', {
    title: 'Frontend Kanban Workspace',
    description: 'Testing board workflows from the React UI'
  });
  assert(createBoardRes.status === 201 && !!createBoardRes.data.data?.board?._id, 'Board created successfully');
  const boardId = createBoardRes.data.data?.board?._id;

  // Verify board list has 1 board now
  const boardsRes = await api.get('/boards');
  assert(boardsRes.data.data?.boards?.length === 1, 'Dashboard now displays 1 board card');

  // 5. Open Board (BoardPage)
  console.log('\n--- 5. BoardPage: Open & Inspect Board ---');
  const boardPageRes = await api.get(`/boards/${boardId}`);
  assert(boardPageRes.data.data?.board?.title === 'Frontend Kanban Workspace', 'BoardPage loads board details');

  // 6. Create Lists
  console.log('\n--- 6. BoardPage: List Management ---');
  const list1Res = await api.post(`/boards/${boardId}/lists`, { title: 'To Do' });
  const list1Id = list1Res.data.data?.list?._id;
  assert(list1Res.status === 201 && !!list1Id, 'Created List 1: "To Do"');

  const list2Res = await api.post(`/boards/${boardId}/lists`, { title: 'In Progress' });
  const list2Id = list2Res.data.data?.list?._id;
  assert(list2Res.status === 201 && !!list2Id, 'Created List 2: "In Progress"');

  const listsRes = await api.get(`/boards/${boardId}/lists`);
  assert(listsRes.data.data?.lists?.length === 2, 'Fetched 2 list columns for Kanban board');

  // 7. Create Task
  console.log('\n--- 7. BoardPage: Task Management ---');
  const taskRes = await api.post(`/boards/${boardId}/lists/${list1Id}/tasks`, {
    title: 'Build React UI components',
    description: 'Implement Kanban columns and cards',
    status: 'To Do',
    assignedTo: userId,
    dueDate: new Date(Date.now() + 86400000).toISOString()
  });
  assert(taskRes.status === 201 && !!taskRes.data.data?.task?._id, 'Created Task in "To Do" list');
  const taskId = taskRes.data.data?.task?._id;

  // 8. Edit Task
  console.log('\n--- 8. Task: Edit & Update ---');
  const updateTaskRes = await api.patch(`/boards/${boardId}/lists/${list1Id}/tasks/${taskId}`, {
    title: 'Build React UI components (Updated)',
    description: 'Updated task description with complete specs'
  });
  assert(updateTaskRes.data.data?.task?.title === 'Build React UI components (Updated)', 'Task title updated');

  // 9. Change Task Status
  console.log('\n--- 9. Task: Change Status ---');
  const statusRes = await api.patch(`/boards/${boardId}/lists/${list1Id}/tasks/${taskId}`, {
    status: 'In Progress'
  });
  assert(statusRes.data.data?.task?.status === 'In Progress', 'Task status changed to "In Progress"');

  // 10. Assign Task
  console.log('\n--- 10. Task: Assignment ---');
  const assignRes = await api.patch(`/boards/${boardId}/lists/${list1Id}/tasks/${taskId}`, {
    assignedTo: userId
  });
  assert(assignRes.data.data?.task?.assignedTo?._id === userId, 'Task assigned to logged-in user');

  // 11. Delete Task
  console.log('\n--- 11. Task: Delete ---');
  const deleteTaskRes = await api.delete(`/boards/${boardId}/lists/${list1Id}/tasks/${taskId}`);
  assert(deleteTaskRes.status === 200, 'Task deleted successfully');

  // 12. Rename List
  console.log('\n--- 12. List: Rename ---');
  const renameListRes = await api.patch(`/boards/${boardId}/lists/${list2Id}`, {
    title: 'Done & Verified'
  });
  assert(renameListRes.data.data?.list?.title === 'Done & Verified', 'List renamed to "Done & Verified"');

  // 13. Delete List
  console.log('\n--- 13. List: Delete ---');
  const deleteListRes = await api.delete(`/boards/${boardId}/lists/${list2Id}`);
  assert(deleteListRes.status === 200, 'List deleted successfully');

  // 14. Edit Board
  console.log('\n--- 14. Board: Edit ---');
  const editBoardRes = await api.patch(`/boards/${boardId}`, {
    title: 'Frontend Kanban Workspace (Updated)'
  });
  assert(editBoardRes.data.data?.board?.title === 'Frontend Kanban Workspace (Updated)', 'Board renamed successfully');

  // 15. Delete Board
  console.log('\n--- 15. Board: Delete ---');
  const deleteBoardRes = await api.delete(`/boards/${boardId}`);
  assert(deleteBoardRes.status === 200, 'Board deleted successfully');

  // 16. Logout & Protected Route Rejection
  console.log('\n--- 16. Logout & Auth Protection ---');
  token = null;
  try {
    await api.get('/boards');
    assert(false, 'Protected route should reject without token');
  } catch (err: any) {
    assert(err.response?.status === 401, 'Logged out request rejected with 401 Unauthorized');
  }

  console.log('\n========================================');
  console.log(`FRONTEND FLOW TEST RESULTS:`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log('========================================\n');

  if (failed > 0) process.exit(1);
}

runFrontendFlow().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
