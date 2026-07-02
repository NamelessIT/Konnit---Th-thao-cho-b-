import { beforeEach, describe, expect, it, vi } from "vitest";

const repoMocks = vi.hoisted(() => ({
  fetchSourceRows: vi.fn(),
  upsertMany: vi.fn(),
}));

vi.mock("../modules/translations/translations.repository", () => ({
  fetchSourceRows: repoMocks.fetchSourceRows,
  upsertMany: repoMocks.upsertMany,
}));

import { importFile } from "../modules/translations/translations.service";

function jsonUpload(rows: unknown[]): Express.Multer.File {
  return {
    buffer: Buffer.from(JSON.stringify(rows)),
    mimetype: "application/json",
    originalname: "translation_ja.json",
  } as Express.Multer.File;
}

describe("translation JSON import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    repoMocks.upsertMany.mockResolvedValue({ inserted: 2, updated: 0 });
  });

  it("remaps stale entity IDs from source_value before upsert", async () => {
    repoMocks.fetchSourceRows.mockResolvedValue([
      {
        id: 37,
        title: "Hoạt động cộng đồng",
        description: null,
        content_json: { title: "Hoạt động cộng đồng", items: [] },
      },
    ]);

    const result = await importFile(
      jsonUpload([
        {
          module: "cms_sections",
          entity_id: 119,
          field: "title",
          locale: "ja",
          source_value: "Hoạt động cộng đồng",
          value: "コミュニティ活動",
        },
        {
          module: "cms_sections",
          entity_id: 119,
          field: "content_json",
          locale: "ja",
          source_value: '{"items":[],"title":"Hoạt động cộng đồng"}',
          value: '{"title":"コミュニティ活動","items":[]}',
        },
      ]),
      1,
    );

    expect(result.errors).toEqual([]);
    expect(repoMocks.upsertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ entity_id: 37, field: "title", locale: "ja" }),
        expect.objectContaining({ entity_id: 37, field: "content_json", locale: "ja" }),
      ]),
      1,
    );
  });

  it("rejects a row when source_value no longer matches an entity", async () => {
    repoMocks.fetchSourceRows.mockResolvedValue([]);
    repoMocks.upsertMany.mockResolvedValue({ inserted: 0, updated: 0 });

    const result = await importFile(
      jsonUpload([
        {
          module: "cms_pages",
          entity_id: 999,
          field: "title",
          locale: "ja",
          source_value: "Trang không tồn tại",
          value: "存在しないページ",
        },
      ]),
      1,
    );

    expect(result.errors).toHaveLength(1);
    expect(repoMocks.upsertMany).toHaveBeenCalledWith([], 1);
  });
});
