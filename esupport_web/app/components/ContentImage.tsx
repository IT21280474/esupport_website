import NextImage, { type ImageProps } from "next/image";

/* next/image for admin-managed content. Uploads are already resized WebP from the Laravel API
   (and reached through a rewrite the optimiser can't follow), so they skip re-optimisation. */
export default function ContentImage(props: ImageProps) {
    const src = typeof props.src === "string" ? props.src : "";
    return <NextImage {...props} unoptimized={props.unoptimized ?? src.startsWith("/uploads/")} />;
}
