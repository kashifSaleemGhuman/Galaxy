'use client';

import { useState } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

export default function EditableSection({ 
  title, 
  content, 
  onSave, 
  canEdit = false,
  sectionKey,
  contentType = 'text' // 'text', 'list', 'paragraph'
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const handleEdit = () => {
    setEditedContent(content);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    setSaving(true);
    try {
      await onSave(sectionKey, editedContent);
      setIsEditing(false);
      setToast({ type: 'success', message: 'Section updated successfully' });
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  if (!canEdit) {
    // Read-only view
    return (
      <section className="space-y-4">
        {title && (
          <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-green-600 pb-2">
            {title}
          </h2>
        )}
        <div className="prose max-w-none">
          {contentType === 'list' ? (
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              {Array.isArray(content) ? content.map((item, idx) => (
                <li key={idx}>{item}</li>
              )) : null}
            </ul>
          ) : contentType === 'paragraph' ? (
            Array.isArray(content) ? content.map((para, idx) => (
              <p key={idx} className="text-gray-700 leading-relaxed mt-4">{para}</p>
            )) : (
              <p className="text-gray-700 leading-relaxed">{content}</p>
            )
          ) : (
            <p className="text-gray-700 leading-relaxed">{content}</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      {(title || canEdit) && (
        <div className={`flex items-center ${title ? 'justify-between border-b-2 border-green-600 pb-2' : 'justify-end mb-2'}`}>
          {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <XMarkIcon className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                loading={saving}
                className="flex items-center gap-2"
              >
                <CheckIcon className="h-4 w-4" />
                Save
              </Button>
            </div>
          )}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-4">
          {contentType === 'list' ? (
            <div className="space-y-2">
              {Array.isArray(editedContent) ? editedContent.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newContent = [...editedContent];
                      newContent[idx] = e.target.value;
                      setEditedContent(newContent);
                    }}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newContent = editedContent.filter((_, i) => i !== idx);
                      setEditedContent(newContent);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )) : null}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditedContent([...editedContent, ''])}
              >
                Add Item
              </Button>
            </div>
          ) : contentType === 'paragraph' ? (
            <div className="space-y-2">
              {Array.isArray(editedContent) ? editedContent.map((para, idx) => (
                <textarea
                  key={idx}
                  value={para}
                  onChange={(e) => {
                    const newContent = [...editedContent];
                    newContent[idx] = e.target.value;
                    setEditedContent(newContent);
                  }}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              )) : (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              )}
            </div>
          ) : (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={4}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          )}
        </div>
      ) : (
        <div className="prose max-w-none">
          {contentType === 'list' ? (
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              {Array.isArray(content) ? content.map((item, idx) => (
                <li key={idx}>{item}</li>
              )) : null}
            </ul>
          ) : contentType === 'paragraph' ? (
            Array.isArray(content) ? content.map((para, idx) => (
              <p key={idx} className="text-gray-700 leading-relaxed mt-4">{para}</p>
            )) : (
              <p className="text-gray-700 leading-relaxed">{content}</p>
            )
          ) : (
            <p className="text-gray-700 leading-relaxed">{content}</p>
          )}
        </div>
      )}
    </section>
  );
}

