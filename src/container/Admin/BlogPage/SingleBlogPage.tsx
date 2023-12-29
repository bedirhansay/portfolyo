"use client";

import { BlogDTO } from "@types";
import {
  Breadcrumb,
  Button,
  ErrorMessage,
  HeadingSection,
  Input,
} from "@components/ui";
import React, { useEffect, useState } from "react";
import { callApi } from "@actions";
import toast from "react-hot-toast";
import { uploadImageToFirabase } from "@helper";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Image from "next/image";
import { BlogSchema } from "@validations";
import dynamic from "next/dynamic";
const Editor = dynamic(() => import("../../../components/Editor"), {
  ssr: false,
});

export const SingleBlogPage = ({ blog }: { blog: BlogDTO }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BlogDTO>({
    resolver: joiResolver(BlogSchema),
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>();
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(blog.description);

  console.log(blog);
  const formFields = [
    { name: "_id", label: "ID", type: "text" },
    { name: "title", label: "Title", type: "text" },
    { name: "category", label: "Category", type: "text" },
  ];

  console.log(errors);

  const onSubmit = async (data: BlogDTO) => {
    setLoading(true);

    const payloads = {
      ...data,
      description: model,
      image: imageUrl?.toString() || blog.image,
    };

    try {
      const res = await callApi({
        method: "patch",
        path: `/blog/${blog._id}`,
        payload: payloads,
      });

      if (res.kind === "ok") {
        toast.success("Blog Güncellendi");

        reset();
        setImageUrl("");
      } else {
        toast.error("Blog Güncellenemedi" + res.error.message);
      }
    } catch (error: any) {
      toast.error(`Blog  Güncellenemedi: ${error.message}`);
    } finally {
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
        path: "blogs",
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

  return (
    <div>
      <Breadcrumb page="blog" sub={blog.title} />
      <HeadingSection title="Deneyimler" />

      <form
        className="flex bg-white px-4 py-10 rounded-md  flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="w-full  relative ">
          <div className="relative">
            <Image
              className="rounded border w-full h-64 "
              alt=""
              width={200}
              height={200}
              src={
                selectedImage
                  ? URL.createObjectURL(selectedImage)
                  : (blog.image as string)
              }
            ></Image>
          </div>

          <Input
            className="hidden"
            id="pickFile"
            label="Fotoğraf Yükle"
            onChange={handleImageChange}
          />
        </div>
        <strong>{blog.slug}</strong>

        <div key={imageUrl}>
          <label htmlFor="itemColor">Image Url</label>
          <Input
            {...register("image")}
            value={(imageUrl as string) || blog.image}
            placeholder="Fotoğraf Yükleyin ya da Unsplash Link"
          />
          <ErrorMessage message={errors.image?.message} />
        </div>

        <div className="w-full flex flex-col gap-5 justify-between">
          {formFields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <Input
                //@ts-ignore
                defaultValue={blog[field.name]}
                {...register(field.name as any)}
                type={field.type}
              />
              <ErrorMessage
                message={(errors as Record<string, any>)[field.name]?.message}
              />
            </div>
          ))}
          <Editor model={model} setModel={setModel} />

          <Button isLoading={loading} type="submit" variant="outline">
            Kaydet
          </Button>
        </div>
      </form>
    </div>
  );
};