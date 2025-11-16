import { JobLogRepository } from "../../../src/api/v1/repositories/jobLogRepository";
import { db } from "../../../src/config/firebaseConfig";
import { mockJobResult, mockJobLog } from "../../helpers/jobMockData";

// Mock Firestore
jest.mock("../../../src/config/firebaseConfig", () => ({
  db: {
    collection: jest.fn(),
  },
  auth: {},
}));

describe("JobLogRepository", () => {
  let jobLogRepository: JobLogRepository;
  let mockCollection: jest.Mock;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockWhere: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockLimit: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    jobLogRepository = new JobLogRepository();

    mockSet = jest.fn().mockResolvedValue(undefined);
    mockGet = jest.fn();
    mockLimit = jest.fn();
    mockOrderBy = jest.fn();
    mockWhere = jest.fn();

    mockDoc = jest.fn().mockReturnValue({
      id: "log-123",
      set: mockSet,
      get: mockGet,
    });

    mockLimit.mockReturnValue({
      get: mockGet,
    });

    mockOrderBy.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    });

    mockWhere.mockReturnValue({
      orderBy: mockOrderBy,
    });

    mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
      where: mockWhere,
      orderBy: mockOrderBy,
    });

    (db.collection as jest.Mock) = mockCollection;
  });

  describe("logJobExecution", () => {
    it("should log a job execution successfully", async () => {
      const result = await jobLogRepository.logJobExecution(mockJobResult);

      expect(mockCollection).toHaveBeenCalledWith("jobLogs");
      expect(mockSet).toHaveBeenCalled();
      expect(result).toHaveProperty("id");
      expect(result.jobName).toBe("expire-goals");
      expect(result.status).toBe("success");
    });
  });

  describe("getRecentLogs", () => {
    it("should get recent job logs", async () => {
      mockGet.mockResolvedValue({
        docs: [
          {
            id: mockJobLog.id,
            data: () => ({
              jobName: mockJobLog.jobName,
              status: mockJobLog.status,
              startTime: mockJobLog.startTime.toISOString(),
              endTime: mockJobLog.endTime.toISOString(),
              duration: mockJobLog.duration,
              itemsProcessed: mockJobLog.itemsProcessed,
              message: mockJobLog.message,
              createdAt: mockJobLog.createdAt.toISOString(),
            }),
          },
        ],
      });

      const result = await jobLogRepository.getRecentLogs(50);

      expect(mockOrderBy).toHaveBeenCalledWith("createdAt", "desc");
      expect(mockLimit).toHaveBeenCalledWith(50);
      expect(result).toHaveLength(1);
      expect(result[0].jobName).toBe("expire-goals");
    });
  });

  describe("getLogsByJobName", () => {
    it("should get logs for a specific job", async () => {
      mockGet.mockResolvedValue({
        docs: [
          {
            id: mockJobLog.id,
            data: () => ({
              jobName: mockJobLog.jobName,
              status: mockJobLog.status,
              startTime: mockJobLog.startTime.toISOString(),
              endTime: mockJobLog.endTime.toISOString(),
              duration: mockJobLog.duration,
              itemsProcessed: mockJobLog.itemsProcessed,
              message: mockJobLog.message,
              createdAt: mockJobLog.createdAt.toISOString(),
            }),
          },
        ],
      });

      const result = await jobLogRepository.getLogsByJobName("expire-goals", 20);

      expect(mockWhere).toHaveBeenCalledWith("jobName", "==", "expire-goals");
      expect(mockOrderBy).toHaveBeenCalledWith("createdAt", "desc");
      expect(mockLimit).toHaveBeenCalledWith(20);
      expect(result).toHaveLength(1);
      expect(result[0].jobName).toBe("expire-goals");
    });
  });
});
