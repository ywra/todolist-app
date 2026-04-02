import type { User, LoginRequest, LoginResponse, RegisterRequest } from '@/types/auth-types';
import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoFilterParams,
} from '@/types/todo-types';
import { TodoStatus } from '@/types/todo-types';
import type {
  ApiResponse,
  ApiListResponse,
  PaginationInfo,
  ApiError,
  ApiErrorResponse,
} from '@/types/api-types';

describe('타입 정의 컴파일 확인', () => {
  describe('auth-types', () => {
    it('User 타입이 올바르게 정의되어 있다', () => {
      const user: User = {
        id: 'user-1',
        email: 'test@example.com',
        name: '테스트',
        createdAt: '2026-04-01T00:00:00.000Z',
      };
      expect(user.id).toBe('user-1');
      expect(user.email).toBe('test@example.com');
    });

    it('LoginRequest 타입이 올바르게 정의되어 있다', () => {
      const req: LoginRequest = {
        email: 'test@example.com',
        password: 'Pass123!',
      };
      expect(req.email).toBe('test@example.com');
    });

    it('LoginResponse 타입이 올바르게 정의되어 있다', () => {
      const res: LoginResponse = {
        token: 'jwt-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: '테스트',
          createdAt: '2026-04-01T00:00:00.000Z',
        },
      };
      expect(res.token).toBe('jwt-token');
    });

    it('RegisterRequest 타입이 올바르게 정의되어 있다', () => {
      const req: RegisterRequest = {
        email: 'test@example.com',
        password: 'Pass123!',
        name: '테스트',
      };
      expect(req.name).toBe('테스트');
    });
  });

  describe('todo-types', () => {
    it('TodoStatus enum이 올바른 값을 가진다', () => {
      expect(TodoStatus.PENDING).toBe('pending');
      expect(TodoStatus.IN_PROGRESS).toBe('in_progress');
      expect(TodoStatus.OVERDUE).toBe('overdue');
      expect(TodoStatus.COMPLETED).toBe('completed');
    });

    it('Todo 타입이 올바르게 정의되어 있다', () => {
      const todo: Todo = {
        id: 'todo-1',
        userId: 'user-1',
        title: '테스트 할일',
        description: null,
        startDate: '2026-04-01',
        dueDate: '2026-04-10',
        isCompleted: false,
        status: TodoStatus.IN_PROGRESS,
        createdAt: '2026-04-01T00:00:00.000Z',
        updatedAt: '2026-04-01T00:00:00.000Z',
      };
      expect(todo.id).toBe('todo-1');
      expect(todo.description).toBeNull();
    });

    it('CreateTodoRequest 타입이 올바르게 정의되어 있다', () => {
      const req: CreateTodoRequest = {
        title: '새 할일',
        startDate: '2026-04-01',
        dueDate: '2026-04-10',
      };
      expect(req.title).toBe('새 할일');
    });

    it('UpdateTodoRequest는 모든 필드가 선택적이다', () => {
      const req: UpdateTodoRequest = {};
      expect(req).toBeDefined();
    });

    it('TodoFilterParams는 모든 필드가 선택적이다', () => {
      const params: TodoFilterParams = { page: 1, size: 20 };
      expect(params.page).toBe(1);
    });
  });

  describe('api-types', () => {
    it('ApiResponse 제네릭 타입이 올바르게 동작한다', () => {
      const res: ApiResponse<string> = {
        success: true,
        data: 'hello',
      };
      expect(res.success).toBe(true);
    });

    it('ApiListResponse 타입이 올바르게 정의되어 있다', () => {
      const pagination: PaginationInfo = {
        page: 1,
        size: 20,
        totalCount: 100,
        totalPages: 5,
      };
      const res: ApiListResponse<string> = {
        success: true,
        data: ['a', 'b'],
        pagination,
      };
      expect(res.data).toHaveLength(2);
    });

    it('ApiErrorResponse 타입이 올바르게 정의되어 있다', () => {
      const err: ApiError = {
        code: 'NOT_FOUND',
        message: '찾을 수 없습니다.',
      };
      const res: ApiErrorResponse = {
        success: false,
        error: err,
      };
      expect(res.success).toBe(false);
    });
  });
});
