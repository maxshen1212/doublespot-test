import { useState } from "react";
import {
  useSpaces,
  useCreateSpace,
  useUpdateSpace,
  useDeleteSpace,
} from "../hooks";
import type { Space, CreateSpaceInput, UpdateSpaceInput } from "../types";

export function SpacesPage() {
  const { data: spaces, isLoading, isError, error } = useSpaces();
  const createMutation = useCreateSpace();
  const updateMutation = useUpdateSpace();
  const deleteMutation = useDeleteSpace();

  // 表單狀態
  const [showForm, setShowForm] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [formData, setFormData] = useState<CreateSpaceInput>({
    name: "",
    capacity: 0,
  });

  // 開啟新增表單
  const handleCreate = () => {
    setEditingSpace(null);
    setFormData({ name: "", capacity: 0 });
    setShowForm(true);
  };

  // 開啟編輯表單
  const handleEdit = (space: Space) => {
    setEditingSpace(space);
    setFormData({ name: space.name, capacity: space.capacity });
    setShowForm(true);
  };

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSpace) {
      const input: UpdateSpaceInput = {};
      if (formData.name !== editingSpace.name) input.name = formData.name;
      if (formData.capacity !== editingSpace.capacity)
        input.capacity = formData.capacity;
      await updateMutation.mutateAsync({ id: editingSpace.id, input });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setShowForm(false);
    setEditingSpace(null);
    setFormData({ name: "", capacity: 0 });
  };

  // 刪除
  const handleDelete = async (id: string) => {
    if (confirm("確定要刪除這個空間嗎？")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Spaces 管理</h1>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + 新增空間
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-100 text-center">
            <p className="text-red-600">
              {error instanceof Error ? error.message : "載入失敗"}
            </p>
          </div>
        )}

        {/* Space List */}
        {spaces && (
          <div className="space-y-4">
            {spaces.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                尚無空間資料，點擊「新增空間」開始建立
              </div>
            ) : (
              spaces.map((space) => (
                <div
                  key={space.id}
                  className="bg-white rounded-xl p-6 shadow-md border border-gray-100 flex justify-between items-center hover:shadow-lg transition-shadow"
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {space.name}
                    </h3>
                    <p className="text-gray-500 mt-1">
                      容量:{" "}
                      <span className="font-medium">{space.capacity}</span> 人
                    </p>
                    <p className="text-xs text-gray-400 mt-2 font-mono">
                      建立時間: {new Date(space.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(space)}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDelete(space.id)}
                      disabled={deleteMutation.isPending}
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingSpace ? "編輯空間" : "新增空間"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    名稱
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="輸入空間名稱"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    容量
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="輸入容納人數"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "儲存中..."
                      : "儲存"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
