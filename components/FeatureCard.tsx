
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
import FeatureCardActionButton from "./FeatureCardActionButton";

interface FeatureCardProps {
  title: string;
  features: string[];
  badge?: string;
  actionLabel?: string;

}

export default function FeatureCard({
  title,
  features,
  badge,
  actionLabel,
}: FeatureCardProps) {
  return (
    <Card className='w-full max-w-sm shadow-lg border border-muted'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>{title}</CardTitle>
          {badge && <Badge variant='secondary'>{badge}</Badge>}
        </div>
      </CardHeader>
      <CardContent className='space-y-2 text-sm'>
        {features.map((feature, idx) => (
          <div key={idx} className='flex items-center gap-2'>
            ✅ <span>{feature}</span>
          </div>
        ))}
      </CardContent>
      {actionLabel && (
        <CardFooter >
          <FeatureCardActionButton label={actionLabel} />
        </CardFooter>
      )}
    </Card>
  );
}
