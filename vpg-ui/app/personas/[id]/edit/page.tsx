"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import JsonEditor from "@/components/json-editor";
import type { Persona } from "@/lib/types";
import { validateSchemaJson } from "@/lib/validators";

// Simple toast hook for notifications
function useToast() {
  const [toasts, setToasts] = useState<Array<{id: string, type: 'success' | 'error', message: string}>>([]);

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, showToast, removeToast };
}

export default function PersonaEditPage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [schema, setSchema] = useState("{}");
  const [nameError, setNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .eq("id", params.id)
        .single();
      
      if (error) {
        console.error("Error fetching persona:", error);
        router.push("/");
        return;
      }

      if (data) {
        setPersona(data as Persona);
        setName(data.name ?? "");
        setDescription(data.description ?? "");
        setSchema(JSON.stringify(data.schema ?? {}, null, 2));
      }
      setIsLoading(false);
    })();
  }, [params.id, supabase, router]);

  // Validate fields in real-time
  useEffect(() => {
    if (name.trim().length === 0) {
      setNameError("Name is required");
    } else if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
    } else {
      setNameError(null);
    }
  }, [name]);

  useEffect(() => {
    if (description.trim().length > 500) {
      setDescriptionError("Description must be less than 500 characters");
    } else {
      setDescriptionError(null);
    }
  }, [description]);

  useEffect(() => {
    const validated = validateSchemaJson(schema);
    if (!validated.ok) {
      setSchemaError(validated.message);
    } else {
      setSchemaError(null);
    }
  }, [schema]);

  const handleBack = () => {
    router.push("/");
  };

  const handleSave = async () => {
    // Final validation before save
    if (nameError || descriptionError) {
      showToast('error', 'Please fix the validation errors before saving.');
      return;
    }

    if (name.trim().length === 0) {
      setNameError("Name is required");
      showToast('error', 'Name is required.');
      return;
    }

    // Validate JSON schema
    const parsedSchema = validateSchemaJson(schema);
    if (!parsedSchema.ok) {
      setSchemaError(parsedSchema.message);
      showToast('error', `Invalid JSON: ${parsedSchema.message}`);
      return;
    }

    setIsSaving(true);

    try {
      // Update persona
      const { error: updateError } = await supabase
        .from("personas")
        .update({ 
          name: name.trim(), 
          description: description.trim() || null, 
          schema: parsedSchema.value, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", persona!.id);

      if (updateError) {
        console.error("Error updating persona:", updateError);
        showToast('error', `Failed to save persona: ${updateError.message}`);
        return;
      }

      // Insert new version
      const { data: userData } = await supabase.auth.getUser();
      const { error: versionError } = await supabase
        .from("persona_versions")
        .insert({
          persona_id: persona!.id,
          schema: parsedSchema.value,
          note: "manual edit",
          created_by: userData.user?.id
        });

      if (versionError) {
        console.warn("Failed to create version:", versionError);
        showToast('error', 'Persona saved but failed to create version history.');
        // Don't fail the save operation for version creation failure
      } else {
        showToast('success', 'Persona saved successfully!');
      }

      // Small delay to show success toast before navigation
      setTimeout(() => {
        router.push("/");
      }, 1000);

    } catch (error) {
      console.error("Save error:", error);
      showToast('error', 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading persona...</p>
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Persona not found</p>
          <button
            onClick={handleBack}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Go back to app
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="w-px h-6 bg-gray-600" />
            <h1 className="text-xl font-semibold truncate max-w-md">
              Edit: {persona.name}
            </h1>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving || nameError !== null || schemaError !== null}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium px-6 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Fields */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-white">Basic Information</h2>
              
              {/* Name Field */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter persona name"
                  className={`w-full bg-gray-700 border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    nameError 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-600 focus:ring-purple-500 focus:border-transparent"
                  }`}
                />
                {nameError && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {nameError}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a brief description of this persona"
                  rows={4}
                  className={`w-full bg-gray-700 border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                    descriptionError 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-600 focus:ring-purple-500 focus:border-transparent"
                  }`}
                />
                <div className="mt-2 flex justify-between items-center">
                  {descriptionError ? (
                    <p className="text-sm text-red-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {descriptionError}
                    </p>
                  ) : (
                    <div></div>
                  )}
                  <span className={`text-sm ${description.length > 450 ? 'text-red-400' : 'text-gray-400'}`}>
                    {description.length}/500
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - JSON Editor */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-white">Schema Configuration</h2>
              
              <div className="space-y-3">
                <label htmlFor="schema" className="block text-sm font-medium text-gray-300">
                  JSON Schema
                </label>
                <div className={`border rounded-lg overflow-hidden ${
                  schemaError ? "border-red-500" : "border-gray-600"
                }`}>
                  <JsonEditor value={schema} onChange={setSchema} />
                </div>
                
                {schemaError && (
                  <p className="text-sm text-red-400 flex items-start gap-1">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{schemaError}</span>
                  </p>
                )}
                
                <div className="text-xs text-gray-400 bg-gray-700 rounded p-3">
                  <p className="font-medium mb-1">Schema Guidelines:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Must be valid JSON object</li>
                    <li>• Use for persona behavior configuration</li>
                    <li>• Example: {"{ \"tone\": \"friendly\", \"style\": \"casual\" }"}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-green-900/90 border-green-700 text-green-100'
                : 'bg-red-900/90 border-red-700 text-red-100'
            }`}
          >
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-2 text-current hover:opacity-70 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
