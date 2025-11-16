import { CleanupOldLogsJob } from "../../../src/jobs/cleanupOldLogsJob";
import { db } from "../../../src/config/firebaseConfig";

// Mock Firestore
jest.mock("../../../src/config/firebaseConfig", () => ({
  db: {
    collection: jest.fn(),
    batch: jest.fn(),
  },
  auth: {},
}));

describe("CleanupOldLogsJob", () => {
  let cleanupOldLogsJob: CleanupOldLogsJob;
  let mockCollection: jest.Mock;
  let mockWhere: jest.Mock;
  let mockGet: jest.Mock;
  let mockBatchDelete: jest.Mock;
  let mockBatchCommit: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    cleanupOldLogsJob = new CleanupOldLogsJob();

    mockBatchCommit = jest.fn().mockResolvedValue(undefined);
    mockBatchDelete = jest.fn();
    mockGet = jest.fn();
    mockWhere = jest.fn();

    // Create the batch mock object
    const batchMock = {
      delete: mockBatchDelete,
      commit: mockBatchCommit,
    };

    mockWhere.mockReturnValue({
      get: mockGet,
    });

    mockCollection = jest.fn().mockReturnValue({
      where: mockWhere,
    });

    (db.collection as jest.Mock) = mockCollection;
    (db.batch as jest.Mock) = jest.fn().mockReturnValue(batchMock);
  });

  describe("execute", () => {
    it("should delete old logs successfully", async () => {
      mockGet.mockResolvedValue({
        docs: [
          { ref: "ref1" },
          { ref: "ref2" },
          { ref: "ref3" },
        ],
      });

      const result = await cleanupOldLogsJob.execute();

      expect(result.status).toBe("success");
      expect(result.itemsProcessed).toBe(3);
      expect(mockBatchDelete).toHaveBeenCalledTimes(3);
      expect(mockBatchCommit).toHaveBeenCalled();
    });

    it("should not commit if no logs to delete", async () => {
      mockGet.mockResolvedValue({
        docs: [],
      });

      const result = await cleanupOldLogsJob.execute();

      expect(result.status).toBe("success");
      expect(result.itemsProcessed).toBe(0);
      expect(mockBatchCommit).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      mockGet.mockRejectedValue(new Error("Database error"));

      const result = await cleanupOldLogsJob.execute();

      expect(result.status).toBe("failure");
      expect(result.error).toBe("Database error");
    });
  });
});
