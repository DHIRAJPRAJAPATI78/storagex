"use client"

import { Button } from "@/components/ui/button";

interface FeatureCardActionButtonProps {
  label: string;

}

export default function FeatureCardActionButton({
  label,
}: FeatureCardActionButtonProps) {
  return (
    <Button className="w-full !cursor-pointer bg-[#FA7275] hover:bg-[#EA6365]" onClick={()=>alert("payment successful") }>
      {label}
    </Button>
  );
}
