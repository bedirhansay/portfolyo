"use client";

import {
  Breadcrumb,
  Button,
  DataTables,
  ErrorMessage,
  HeadingSection,
  Input,
  Modal,
} from "@components/ui";
import React, { useEffect, useState } from "react";
import { ProjectDTO } from "@types";
import { callApi } from "@actions";
import toast from "react-hot-toast";
import { uploadImageToFirabase } from "@helper";
import { StringToArray } from "@utils";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Image from "next/image";
import { ProjectSchema } from "../../lib/validation/_skills.validation";
import { DeleteBox } from "@components";

export const ProjectsPage = ({ projects }: { projects: ProjectDTO[] }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectDTO>({
    resolver: joiResolver(ProjectSchema),
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [operation, setOperation] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<ProjectDTO>();
  const [deleting, setDeleting] = useState(false);

  const formFields = [
    { name: "company", label: "Company", type: "text" },
    { name: "projectName", label: "Project Name", type: "text" },
    { name: "time", label: "Time", type: "text" },
    { name: "area", label: "Area", type: "text" },
    { name: "tags", label: "Tags", type: "text" },
    { name: "description", label: "Description", type: "text" },
    { name: "goals", label: "Goals", type: "textarea" },
    { name: "scope", label: "Scope", type: "text" },
    { name: "requirements", label: "Requirements", type: "textarea" },
    { name: "tasks", label: "Tasks", type: "text" },
  ];

  const onSubmit = async (data: ProjectDTO) => {
    setLoading(true);

    const payloads = {
      ...data,
      tags: StringToArray(data?.tags),
      goals: StringToArray(data.goals),
      requirements: StringToArray(data?.requirements),
      tasks: StringToArray(data.tasks),
      image: imageUrl?.toString(),
    };

    try {
      const res = await callApi({
        method: "post",
        path: "projects",
        payload: payloads,
      });

      if (res.kind === "ok") {
        toast.success("Proje Eklendi");
        reset();
        setImageUrl("");
      } else {
        toast.error("Proje Eklenemedi" + res.error.message);
      }
    } catch (error: any) {
      toast.error(`Proje  Güncellenemedi: ${error.message}`);
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    setLoading(true);
    try {
      const selectedFile = e.target.files?.[0];

      if (!selectedFile) {
        throw new Error("Lütfen bir dosya seçin.");
      }
      const payload = {
        image: selectedFile,
        path: "skills",
        name: selectedFile.name,
      };
      const img = await uploadImageToFirabase(payload);
      setSelectedImage(selectedFile);
      setImageUrl(img?.url || "");
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast.error("Resim yüklenemedi. Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      const res = await callApi({
        method: "delete",
        path: `projects/${selectedId}`,
      });

      if (res.kind === "ok") {
        setOpen(false);
        toast.success("Proje silindi");
      }
    } catch (error) {
      toast.error("Proje Silinemedi");
      setOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const selectedSkill = projects.find((item) => item._id === selectedId);
    if (selectedId) {
      setOpen(true);
      setSelectedItem(selectedSkill);
    }
  }, [selectedId, operation]);

  const buttonHandler = () => {
    setOperation("create");
    setOpen(true);
  };
  return (
    <div>
      <Breadcrumb page="Projeler" />
      <HeadingSection
        title="Projeler"
        showButton
        onButtonClick={buttonHandler}
      />
      <DataTables
        setOperation={setOperation}
        setId={setSelectedId}
        data={projects}
      />
      <Modal onClose={setOpen} isOpen={open}>
        {operation === "del" ? (
          <DeleteBox
            loading={deleting}
            onClick={onDelete}
            title={selectedItem?.company}
          />
        ) : (
          <form
            className="flex bg-white px-4 py-10 rounded-md  flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex-between">
              <Image
                width={200}
                height={100}
                className="rounded border"
                alt=""
                src={selectedImage ? URL.createObjectURL(selectedImage) : ""}
              ></Image>

              <Input
                className="hidden"
                id="pickFile"
                label="Fotoğraf Yükle"
                onChange={handleImageChange}
                type="file"
              />
            </div>
            <div key={imageUrl}>
              <label htmlFor="itemColor">Image Url</label>
              <Input
                {...register("image")}
                value={imageUrl as string}
                placeholder="Fotoğraf Yükleyin ya da Unsplash Link"
              />
              <ErrorMessage message={errors.image?.message} />
            </div>

            <div className="w-full flex flex-col gap-5 justify-between">
              {formFields.map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name}>{field.label}</label>
                  <Input {...register(field.name as any)} type={field.type} />
                  <ErrorMessage
                    message={
                      (errors as Record<string, any>)[field.name]?.message
                    }
                  />
                </div>
              ))}

              <Button isLoading={loading} type="submit" variant="outline">
                Kaydet
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
