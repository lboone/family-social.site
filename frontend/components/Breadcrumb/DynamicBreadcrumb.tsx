"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

interface BreadcrumbProps {
  className?: string;
}

export default function DynamicBreadcrumb({ className }: BreadcrumbProps) {
  const pathname = usePathname();

  // Split the pathname and filter out empty strings
  const pathSegments = pathname.split("/").filter(Boolean);

  // Generate breadcrumb items
  const breadcrumbItems = pathSegments.map((segment, index) => {
    // Build the href for this segment
    const href = "/" + pathSegments.slice(0, index + 1).join("/");

    // Format the segment name (capitalize and replace hyphens with spaces)
    const name = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      name,
      href,
      isLast: index === pathSegments.length - 1,
    };
  });

  // Don't render breadcrumb on home page
  if (pathSegments.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 mb-5 md:mt-10 md:mb-10">
      <Breadcrumb
        className={cn("md:hidden bg-muted/30 rounded-lg p-3", className)}
      >
        <BreadcrumbList className="flex-wrap gap-2">
          {/* Home link */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50 min-h-[44px] min-w-[44px] justify-center"
              >
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {/* Render breadcrumb items */}
          {breadcrumbItems.map((item, index) => (
            <Fragment key={index}>
              <BreadcrumbSeparator className="text-muted-foreground/60 select-none" />
              <BreadcrumbItem>
                {item.isLast ? (
                  <BreadcrumbPage className="inline-flex items-center px-3 py-2 text-sm font-medium text-foreground rounded-md bg-muted/50 min-h-[44px] min-w-[44px] justify-center">
                    {item.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={item.href}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50 min-h-[44px] min-w-[44px] justify-center"
                    >
                      {item.name}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
