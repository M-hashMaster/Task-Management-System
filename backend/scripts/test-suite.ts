/* eslint-disable no-console */
const BASE_URL = 'http://localhost:3000';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`, details ? details : '');
    failedTests++;
  }
}

async function request(
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<{ status: number; body: ApiResponse }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const resBody = (await res.json()) as ApiResponse;
  return { status: res.status, body: resBody };
}

async function runTests() {
  console.log('\n========================================');
  console.log('STARTING FULL API SMOKE & SECURITY SUITE');
  console.log('========================================\n');

  const timestamp = Date.now();
  const userAEmail = `user_a_${timestamp}@example.com`;
  const userBEmail = `user_b_${timestamp}@example.com`;
  const password = 'password123';

  // 1. Root and Health Endpoints
  console.log('--- 1. Root & Health Endpoints ---');
  const rootRes = await request('GET', '/');
  assert(rootRes.status === 200 && rootRes.body.success === true, 'GET / returns 200 and success: true');

  const healthRes = await request('GET', '/api/health');
  assert(healthRes.status === 200 && healthRes.body.message === 'API is healthy', 'GET /api/health returns 200 and healthy');

  // 2. Authentication - User A
  console.log('\n--- 2. Auth: User A Registration & Login ---');
  const regARes = await request('POST', '/api/auth/register', {
    name: 'User Alpha',
    email: userAEmail,
    password
  });
  assert(regARes.status === 201 && !!regARes.body.data?.token, 'User A registered successfully with JWT');
  assert(!('password' in (regARes.body.data?.user || {})), 'User A response does NOT contain password');

  // Duplicate email check
  const dupRes = await request('POST', '/api/auth/register', {
    name: 'User Alpha Duplicate',
    email: userAEmail,
    password
  });
  assert(dupRes.status === 400 && dupRes.body.success === false, 'Duplicate email registration rejected with 400');

  // Login User A
  const loginARes = await request('POST', '/api/auth/login', {
    email: userAEmail,
    password
  });
  assert(loginARes.status === 200 && !!loginARes.body.data?.token, 'User A logged in successfully');
  const tokenA = loginARes.body.data?.token;
  const userAId = loginARes.body.data?.user?._id;

  // 3. Authentication - User B
  console.log('\n--- 3. Auth: User B Registration & Login ---');
  const regBRes = await request('POST', '/api/auth/register', {
    name: 'User Beta',
    email: userBEmail,
    password
  });
  assert(regBRes.status === 201 && !!regBRes.body.data?.token, 'User B registered successfully');
  const tokenB = regBRes.body.data?.token;
  const userBId = regBRes.body.data?.user?._id;

  // 4. Auth Protection Checks
  console.log('\n--- 4. Authentication Middleware Verification ---');
  const noTokenRes = await request('GET', '/api/boards');
  assert(noTokenRes.status === 401, 'Protected route without token returns 401');

  const invalidTokenRes = await request('GET', '/api/boards', undefined, 'invalid.jwt.token');
  assert(invalidTokenRes.status === 401, 'Protected route with invalid token returns 401');

  // 5. Board CRUD (User A)
  console.log('\n--- 5. Board CRUD Operations (User A) ---');
  const createBoardRes = await request('POST', '/api/boards', {
    title: 'Alpha Project Board',
    description: 'Sprint planning and backlog'
  }, tokenA);
  assert(createBoardRes.status === 201 && !!createBoardRes.body.data?.board?._id, 'User A created board');
  const boardAId = createBoardRes.body.data?.board?._id;

  const getBoardsRes = await request('GET', '/api/boards', undefined, tokenA);
  assert(getBoardsRes.status === 200 && getBoardsRes.body.data?.boards?.length === 1, 'User A fetched boards (count = 1)');

  const getBoardByIdRes = await request('GET', `/api/boards/${boardAId}`, undefined, tokenA);
  assert(getBoardByIdRes.status === 200 && getBoardByIdRes.body.data?.board?.title === 'Alpha Project Board', 'User A fetched board by ID');

  const updateBoardRes = await request('PATCH', `/api/boards/${boardAId}`, {
    title: 'Alpha Project Board Updated'
  }, tokenA);
  assert(updateBoardRes.status === 200 && updateBoardRes.body.data?.board?.title === 'Alpha Project Board Updated', 'User A partially updated board title');

  // 6. List CRUD (User A)
  console.log('\n--- 6. List CRUD Operations (User A) ---');
  const createListRes = await request('POST', `/api/boards/${boardAId}/lists`, {
    title: 'To Do'
  }, tokenA);
  assert(createListRes.status === 201 && !!createListRes.body.data?.list?._id, 'User A created list "To Do"');
  const listAId = createListRes.body.data?.list?._id;

  const getListsRes = await request('GET', `/api/boards/${boardAId}/lists`, undefined, tokenA);
  assert(getListsRes.status === 200 && getListsRes.body.data?.lists?.length === 1, 'User A fetched lists for board');

  const getListByIdRes = await request('GET', `/api/boards/${boardAId}/lists/${listAId}`, undefined, tokenA);
  assert(getListByIdRes.status === 200 && getListByIdRes.body.data?.list?.title === 'To Do', 'User A fetched list by ID');

  const updateListRes = await request('PATCH', `/api/boards/${boardAId}/lists/${listAId}`, {
    title: 'Backlog / To Do'
  }, tokenA);
  assert(updateListRes.status === 200 && updateListRes.body.data?.list?.title === 'Backlog / To Do', 'User A updated list title');

  // 7. Task CRUD, Status, and Assignment (User A)
  console.log('\n--- 7. Task CRUD, Status, & Assignment (User A) ---');
  const createTaskRes = await request('POST', `/api/boards/${boardAId}/lists/${listAId}/tasks`, {
    title: 'Implement authentication',
    description: 'Create JWT authentication',
    status: 'To Do',
    assignedTo: userAId
  }, tokenA);
  assert(createTaskRes.status === 201 && !!createTaskRes.body.data?.task?._id, 'User A created task with initial status "To Do"');
  const taskAId = createTaskRes.body.data?.task?._id;

  // Task Status Rejection Test
  const invalidStatusRes = await request('POST', `/api/boards/${boardAId}/lists/${listAId}/tasks`, {
    title: 'Invalid Task',
    status: 'Archive'
  }, tokenA);
  assert(invalidStatusRes.status === 400, 'Invalid task status rejected with 400');

  // Task Non-existent User Assignment Test
  const fakeUserId = '507f1f77bcf86cd799439011';
  const invalidAssignRes = await request('POST', `/api/boards/${boardAId}/lists/${listAId}/tasks`, {
    title: 'Task with ghost user',
    assignedTo: fakeUserId
  }, tokenA);
  assert(invalidAssignRes.status === 400, 'Assigning task to non-existent user rejected with 400');

  // Get Tasks
  const getTasksRes = await request('GET', `/api/boards/${boardAId}/lists/${listAId}/tasks`, undefined, tokenA);
  assert(getTasksRes.status === 200 && getTasksRes.body.data?.tasks?.length === 1, 'User A fetched tasks in list');

  // Get Specific Task
  const getTaskByIdRes = await request('GET', `/api/boards/${boardAId}/lists/${listAId}/tasks/${taskAId}`, undefined, tokenA);
  assert(getTaskByIdRes.status === 200 && getTaskByIdRes.body.data?.task?.title === 'Implement authentication', 'User A fetched task by ID');

  // Update Task Status to "In Progress"
  const updateStatusRes = await request('PATCH', `/api/boards/${boardAId}/lists/${listAId}/tasks/${taskAId}`, {
    status: 'In Progress'
  }, tokenA);
  assert(updateStatusRes.status === 200 && updateStatusRes.body.data?.task?.status === 'In Progress', 'Task status updated to "In Progress"');

  // Assign Task to User B
  const assignToBRes = await request('PATCH', `/api/boards/${boardAId}/lists/${listAId}/tasks/${taskAId}`, {
    assignedTo: userBId
  }, tokenA);
  assert(assignToBRes.status === 200 && assignToBRes.body.data?.task?.assignedTo?._id === userBId, 'Task successfully assigned to User B');

  // Update Task Status to "Done"
  const updateDoneRes = await request('PATCH', `/api/boards/${boardAId}/lists/${listAId}/tasks/${taskAId}`, {
    status: 'Done'
  }, tokenA);
  assert(updateDoneRes.status === 200 && updateDoneRes.body.data?.task?.status === 'Done', 'Task status updated to "Done"');

  // 8. SECURITY & OWNERSHIP MODEL TESTS (User B vs User A resources)
  console.log('\n--- 8. Security & Multi-Tenant Ownership Tests ---');

  // User B tries to view User A's boards
  const userBBoardsRes = await request('GET', '/api/boards', undefined, tokenB);
  assert(userBBoardsRes.status === 200 && userBBoardsRes.body.data?.boards?.length === 0, 'User B sees 0 boards (cannot see User A boards)');

  // User B tries to view User A's board directly by ID
  const bAccessABoardRes = await request('GET', `/api/boards/${boardAId}`, undefined, tokenB);
  assert(bAccessABoardRes.status === 403, 'User B cannot GET User A board by ID (403 Forbidden)');

  // User B tries to modify User A's board
  const bUpdateABoardRes = await request('PATCH', `/api/boards/${boardAId}`, {
    title: 'Hacked by User B'
  }, tokenB);
  assert(bUpdateABoardRes.status === 403, 'User B cannot modify User A board (403 Forbidden)');

  // User B tries to delete User A's board
  const bDeleteABoardRes = await request('DELETE', `/api/boards/${boardAId}`, undefined, tokenB);
  assert(bDeleteABoardRes.status === 403, 'User B cannot delete User A board (403 Forbidden)');

  // User B tries to create a list inside User A's board
  const bCreateListRes = await request('POST', `/api/boards/${boardAId}/lists`, {
    title: 'Unauthorized List'
  }, tokenB);
  assert(bCreateListRes.status === 403, 'User B cannot create a list inside User A board (403 Forbidden)');

  // User B tries to get User A's lists
  const bGetListsRes = await request('GET', `/api/boards/${boardAId}/lists`, undefined, tokenB);
  assert(bGetListsRes.status === 403, 'User B cannot view User A lists (403 Forbidden)');

  // User B tries to create a task inside User A's list
  const bCreateTaskRes = await request('POST', `/api/boards/${boardAId}/lists/${listAId}/tasks`, {
    title: 'Unauthorized Task'
  }, tokenB);
  assert(bCreateTaskRes.status === 403, 'User B cannot create task in User A list (403 Forbidden)');

  // User B tries to get User A's tasks
  const bGetTasksRes = await request('GET', `/api/boards/${boardAId}/lists/${listAId}/tasks`, undefined, tokenB);
  assert(bGetTasksRes.status === 403, 'User B cannot view User A tasks (403 Forbidden)');

  // User B tries to modify User A's task
  const bUpdateTaskRes = await request('PATCH', `/api/boards/${boardAId}/lists/${listAId}/tasks/${taskAId}`, {
    title: 'Compromised Task'
  }, tokenB);
  assert(bUpdateTaskRes.status === 403, 'User B cannot update User A task (403 Forbidden)');

  // 9. RELATIONAL INTEGRITY / MISMATCHED IDs TEST
  console.log('\n--- 9. Relational Integrity Checks (Mismatched IDs) ---');

  // Create User B's own board and list
  const bBoardRes = await request('POST', '/api/boards', { title: 'User B Board' }, tokenB);
  const boardBId = bBoardRes.body.data?.board?._id;
  const bListRes = await request('POST', `/api/boards/${boardBId}/lists`, { title: 'User B List' }, tokenB);
  const listBId = bListRes.body.data?.list?._id;

  // Passing List A ID under Board B (even though user owns Board B, List A belongs to Board A)
  const mismatchedListRes = await request('GET', `/api/boards/${boardBId}/lists/${listAId}`, undefined, tokenB);
  assert(mismatchedListRes.status === 400 || mismatchedListRes.status === 404, 'Mismatched boardId and listId rejected (cannot bypass hierarchy)');

  // Passing Task A ID under List B
  const mismatchedTaskRes = await request('GET', `/api/boards/${boardBId}/lists/${listBId}/tasks/${taskAId}`, undefined, tokenB);
  assert(mismatchedTaskRes.status === 400 || mismatchedTaskRes.status === 404, 'Mismatched listId and taskId rejected (cannot bypass hierarchy)');

  // 10. CLEANUP & CASCADE DELETION TEST
  console.log('\n--- 10. Cleanup & Cascade Deletion Flow ---');

  // Delete Task A
  const deleteTaskRes = await request('DELETE', `/api/boards/${boardAId}/lists/${listAId}/tasks/${taskAId}`, undefined, tokenA);
  assert(deleteTaskRes.status === 200, 'User A deleted task');

  const verifyTaskDeletedRes = await request('GET', `/api/boards/${boardAId}/lists/${listAId}/tasks/${taskAId}`, undefined, tokenA);
  assert(verifyTaskDeletedRes.status === 404, 'Task verified deleted (404)');

  // Create another task, then delete list to verify list cascade
  const task2Res = await request('POST', `/api/boards/${boardAId}/lists/${listAId}/tasks`, { title: 'To be cascade deleted' }, tokenA);
  const task2Id = task2Res.body.data?.task?._id;
  assert(!!task2Id, 'User A created second task for list cascade deletion test');

  const deleteListRes = await request('DELETE', `/api/boards/${boardAId}/lists/${listAId}`, undefined, tokenA);
  assert(deleteListRes.status === 200, 'User A deleted list');

  const verifyListDeletedRes = await request('GET', `/api/boards/${boardAId}/lists/${listAId}`, undefined, tokenA);
  assert(verifyListDeletedRes.status === 404, 'List verified deleted (404)');

  // Delete Board A
  const deleteBoardRes = await request('DELETE', `/api/boards/${boardAId}`, undefined, tokenA);
  assert(deleteBoardRes.status === 200, 'User A deleted board');

  const verifyBoardDeletedRes = await request('GET', `/api/boards/${boardAId}`, undefined, tokenA);
  assert(verifyBoardDeletedRes.status === 404, 'Board verified deleted (404)');

  // Clean up User B's board
  await request('DELETE', `/api/boards/${boardBId}`, undefined, tokenB);

  console.log('\n========================================');
  console.log(`TEST SUITE SUMMARY:`);
  console.log(`  Passed: ${passedTests}`);
  console.log(`  Failed: ${failedTests}`);
  console.log('========================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
