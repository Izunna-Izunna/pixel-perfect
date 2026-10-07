import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ChevronLeft, CircleAlert, ExternalLink, Eye, FileText, Image as ImageIcon, MessageCircle, ShieldAlert, ShieldCheck, Star, Truck, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type MoverReview } from "@/features/core/mock-data";
import { KeyValue, MaskedPhone, ProfileActions, Stat } from "@/features/core/profile-ui";
import { StatusBadge } from "@/features/core/status-badge";
import { Workspace } from "@/features/core/workspace";
import { formatMoney } from "@/lib/format";
import { formatLondon } from "@/lib/time";
import { DateTime } from "luxon";
import { useOperations } from "@/features/core/operations-store";

export const Route = createFileRoute("/_authenticated/movers/$id")({
  head: () => ({ meta: [{ title: "Mover record — Cary Mission Control" }, { name: "description", content: "Mover identity, documents, jobs, payouts and reviews for Cary operators." }, { property: "og:title", content: "Mover record — Cary Mission Control" }, { property: "og:description", content: "Mover identity, documents, jobs, payouts and reviews for Cary operators." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: MoverProfile,
});

function MoverProfile() {
  const { id } = Route.useParams();
  const { bookings, movers, conversations, setMoverDocumentStatus } = useOperations();
  const mover = movers.find((item) => item.id === id) ?? movers[0];
  const initialLicenceStatus =
    mover?.licenceStatus ??
    (mover?.licenceDocUrl
      ? "submitted"
      : (mover?.onboardingData as any)?.licence_deferred
      ? "deferred"
      : "not_submitted");
  const [licenceStatus, setLicenceStatus] = useState(initialLicenceStatus);

  const initialInsuranceStatus =
    mover?.insuranceStatus ??
    (mover?.insuranceDocUrl
      ? "submitted"
      : (mover?.onboardingData as any)?.insurance_deferred
      ? "deferred"
      : "not_submitted");
  const [insuranceStatus, setInsuranceStatus] = useState(initialInsuranceStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null);

  const jobs = useMemo(() => bookings.filter((item) => item.moverId === mover?.id), [mover?.id]);
  const reviews = useMemo(() => [] as MoverReview[], [mover?.id]);
  const cleanPhone = mover?.phone?.replace(/[^\d]/g, "") ?? "";
  const conversation = conversations.find(
    (item) => item.contactId === mover?.id || (cleanPhone && item.id.includes(cleanPhone))
  );

  if (!mover) return <Workspace title="Mover"><p className="text-sm text-muted-foreground">This mover record is unavailable.</p></Workspace>;
  const verificationNeeded = mover.status === "pending_verification";

  return (
    <Workspace title="Mover">
      <div className="mx-auto max-w-7xl">
        <Button asChild variant="ghost" size="sm">
          <Link to="/movers"><ChevronLeft />Movers</Link>
        </Button>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-live-tint text-live-foreground">
                <Truck />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-2xl font-semibold">{mover.name}</h2>
                  <StatusBadge status={mover.status} />
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">{mover.businessName}</p>
                {mover.fullName && mover.fullName !== mover.name && (
                  <p className="text-xs text-muted-foreground">Legal representative: <span className="font-medium text-foreground">{mover.fullName}</span></p>
                )}
                <div className="mt-2"><MaskedPhone phone={mover.phone} /></div>
              </div>
            </div>
          </div>
          {conversation ? (
            <ProfileActions messageTo={conversation.id} backTo="/movers" />
          ) : (
            <Button asChild variant="outline">
              <Link to="/movers"><MessageCircle />No conversation yet</Link>
            </Button>
          )}
        </div>

        {mover.openIssue ? (
          <div className="mt-5 flex items-start gap-3 border border-warning/30 bg-warning-tint p-4">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-semibold">Attention required</p>
              <p className="mt-1 text-sm text-muted-foreground">{mover.openIssue}</p>
            </div>
            <Button className="ml-auto" size="sm" variant="outline" onClick={() => setMessage("Document review opened below.")}>
              Review documents
            </Button>
          </div>
        ) : null}

        {message ? <p className="mt-3 text-sm text-live-foreground font-medium" role="status">{message}</p> : null}

        <div className="mt-6 flex gap-6 overflow-x-auto border-y border-border py-5">
          <Stat label="Jobs completed" value={mover.jobsCompleted} />
          <Stat label="Rating" value={mover.rating ? `${mover.rating} / 5` : "New"} />
          <Stat label="Acceptance" value={mover.acceptanceRate} />
          <Stat label="Response" value={mover.responseTime} />
          <Stat label="Lifetime payout" value={formatMoney(mover.lifetimeEarnings)} />
        </div>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">
              Documents
              {(mover.licenceDocUrl || mover.insuranceDocUrl) && (
                <span className="ml-1.5 rounded-full bg-live/20 px-1.5 py-0.5 text-[10px] font-bold text-live-foreground">
                  {(mover.licenceDocUrl ? 1 : 0) + (mover.insuranceDocUrl ? 1 : 0) + (mover.verificationDocUrls?.length ?? 0)}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW TAB: COMPLETE ONBOARDING DATA ── */}
          <TabsContent value="overview">
            <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
              <section className="space-y-5">
                <div className="border border-border bg-card p-5">
                  <p className="micro-label">Identity & Business Details</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <KeyValue label="Full Legal Name" value={mover.fullName || mover.name} />
                    <KeyValue label="Trading / Business Name" value={mover.businessName} />
                    <KeyValue label="WhatsApp Number" value={mover.phone} />
                    <KeyValue label="Driving Licence Type" value={mover.drivingLicenceType ? mover.drivingLicenceType.replace(/_/g, " ").toUpperCase() : "Full UK Licence"} />
                    <KeyValue label="Team Size" value={mover.teamSize ? `${mover.teamSize} people` : "Solo / Flexible"} />
                    <KeyValue label="Pricing Model" value={mover.pricingModel ? mover.pricingModel.replace(/_/g, " ") : "Job by job"} />
                  </div>
                </div>

                <div className="border border-border bg-card p-5">
                  <p className="micro-label">Vehicles & Service Capabilities</p>
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Registered Vehicles ({mover.vehicles.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {mover.vehicles.length > 0 ? (
                        mover.vehicles.map((vehicle) => (
                          <span key={vehicle} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold">
                            <span>🚐</span> {vehicle}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No vehicles registered</span>
                      )}
                    </div>
                  </div>

                  {mover.serviceAreas && mover.serviceAreas.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Covered Service Areas:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {mover.serviceAreas.map((area) => (
                          <span key={area} className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium">
                            📍 {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {mover.services && mover.services.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Offered Services:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {mover.services.map((srv) => (
                          <span key={srv} className="rounded-md border border-border bg-live-tint text-live-foreground px-2.5 py-1 text-xs font-medium capitalize">
                            ✓ {srv.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {mover.availability && mover.availability.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Availability:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {mover.availability.map((avail) => (
                          <span key={avail} className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                            🗓️ {avail.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border border-border bg-card p-5">
                  <p className="micro-label">Preferences & Restrictions</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <KeyValue label="Job Preferences" value={mover.jobPreferences || "All jobs accepted"} />
                    <KeyValue label="Exclusions / Won't Move" value={mover.jobExclusions || "None"} />
                  </div>
                </div>
              </section>

              <aside className="space-y-5">
                <section className="border border-border bg-card p-5">
                  <p className="micro-label">Verification & Compliance</p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Account Status</span>
                      <StatusBadge status={mover.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Driver Licence</span>
                      <StatusBadge status={licenceStatus} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Insurance</span>
                      <StatusBadge status={insuranceStatus} />
                    </div>
                  </div>

                  <div className="mt-5 border-t border-border pt-4 space-y-2">
                    <p className="text-xs text-muted-foreground">Registration: {formatLondon(mover.joinedAt)}</p>
                    <p className="text-xs text-muted-foreground">Last Activity: {formatLondon(mover.lastActiveAt)}</p>
                  </div>
                </section>

                {/* Quick Document Snapshot */}
                <section className="border border-border bg-card p-5">
                  <p className="micro-label">Uploaded Document Previews</p>
                  <div className="mt-3 space-y-3">
                    {mover.licenceDocUrl ? (
                      <div
                        onClick={() => setPreviewDoc({ title: "Driver Licence", url: mover.licenceDocUrl! })}
                        className="group relative cursor-pointer overflow-hidden rounded-md border border-border bg-muted hover:border-live transition-all"
                      >
                        <img
                          src={mover.licenceDocUrl}
                          alt="Driver licence"
                          className="h-28 w-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs text-white font-medium transition-opacity">
                          <Eye size={14} /> View Licence
                        </div>
                        <p className="p-2 text-xs font-semibold truncate bg-card">Driver Licence Document</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No licence document image on file.</p>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </TabsContent>

          {/* ── DOCUMENTS TAB: HIGH RES PREVIEWS & VERIFICATION ── */}
          <TabsContent value="documents">
            <section className="mt-4 grid gap-5 lg:grid-cols-2">
              <DocumentCard
                title="Driver Licence"
                status={licenceStatus}
                uploadedAt={mover.licenceDocUrl ? mover.licenceUploadedAt : (licenceStatus === "deferred" ? "Deferred during onboarding" : "Not uploaded")}
                imageUrl={mover.licenceDocUrl}
                onViewFull={() => mover.licenceDocUrl && setPreviewDoc({ title: "Driver Licence", url: mover.licenceDocUrl })}
                onApprove={() => {
                  setLicenceStatus("approved");
                  setMoverDocumentStatus(mover.id, "approved", "Driver licence verified and approved by admin operator.");
                  setMessage("Driver licence approved. Mover status updated to verified in live database.");
                }}
                onRequest={() => {
                  setLicenceStatus("submitted");
                  setMoverDocumentStatus(mover.id, "submitted", "Clearer copy of driver licence requested.");
                  setMessage("Requested clearer licence copy.");
                }}
              />

              <DocumentCard
                title="Goods in Transit / Liability Insurance"
                status={insuranceStatus}
                uploadedAt={mover.insuranceDocUrl ? mover.insuranceExpiresAt : (insuranceStatus === "deferred" ? "Deferred during onboarding" : "Not uploaded")}
                imageUrl={mover.insuranceDocUrl}
                onViewFull={() => mover.insuranceDocUrl && setPreviewDoc({ title: "Insurance Certificate", url: mover.insuranceDocUrl })}
                onApprove={() => {
                  setInsuranceStatus("approved");
                  setMessage("Insurance certificate recorded as verified.");
                }}
                onRequest={() => {
                  setInsuranceStatus("submitted");
                  setMessage("Requested updated insurance policy copy.");
                }}
              />
            </section>

            {mover.verificationDocUrls && mover.verificationDocUrls.length > 0 && (
              <section className="mt-6 border border-border bg-card p-5">
                <p className="micro-label">Additional Verification Documents</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {mover.verificationDocUrls.map((url, idx) => (
                    <div
                      key={url}
                      onClick={() => setPreviewDoc({ title: `Verification Document #${idx + 1}`, url })}
                      className="group cursor-pointer rounded-md border border-border bg-muted overflow-hidden hover:border-live transition-colors"
                    >
                      <img src={url} alt={`Verification document ${idx + 1}`} className="h-36 w-full object-cover" />
                      <p className="p-2 text-xs font-semibold truncate bg-card">Document #{idx + 1}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {verificationNeeded && (
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                <Button
                  onClick={() => {
                    setLicenceStatus("approved");
                    setMoverDocumentStatus(mover.id, "approved", "Mover verified by admin operator.");
                    setMessage("Mover verified successfully in live database.");
                  }}
                >
                  <ShieldCheck />Verify Mover
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setLicenceStatus("rejected");
                    setMoverDocumentStatus(mover.id, "rejected", "Documents rejected by admin operator.");
                    setMessage("Mover documents rejected.");
                  }}
                >
                  <ShieldAlert />Reject Mover
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ── JOBS TAB ── */}
          <TabsContent value="jobs">
            <section className="mt-4 border border-border bg-card p-5">
              <p className="micro-label">Past and upcoming jobs</p>
              <div className="mt-4 divide-y divide-border">
                {jobs.length ? (
                  jobs.map((job) => (
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-3" key={job.ref}>
                      <div>
                        <Link to="/bookings/$ref" params={{ ref: job.ref }} className="font-mono text-sm font-semibold text-primary">
                          {job.ref}
                        </Link>
                        <p className="mt-1 text-sm">{job.route}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatLondon(job.moveAt)} · {job.items}</p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={job.status} />
                        <p className="mt-2 font-mono text-sm font-semibold">{formatMoney(Math.max(0, job.total - 7))}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No jobs have been assigned yet.</p>
                )}
              </div>
            </section>
          </TabsContent>

          {/* ── PAYOUTS TAB ── */}
          <TabsContent value="payouts">
            <section className="mt-4 border border-border bg-card p-5">
              <p className="micro-label">Earnings and payouts</p>
              <div className="mt-4 space-y-3">
                {jobs.map((job) => (
                  <div className="flex items-center justify-between border-b border-border pb-3 last:border-0" key={job.ref}>
                    <div>
                      <Link to="/bookings/$ref" params={{ ref: job.ref }} className="font-mono text-sm font-semibold text-primary">
                        {job.ref}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {job.status === "completed" ? "Released" : "Held until move completion"}
                      </p>
                    </div>
                    <p className="font-mono text-sm font-semibold">{formatMoney(Math.max(0, job.total - 7))}</p>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* ── REVIEWS TAB ── */}
          <TabsContent value="reviews">
            <section className="mt-4 border border-border bg-card p-5">
              <p className="micro-label">Customer reviews</p>
              <div className="mt-4 space-y-4">
                {reviews.length ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{review.author}</p>
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="size-4 fill-live text-live" />{review.rating}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{review.body}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{formatLondon(review.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No reviews have been captured yet.</p>
                )}
              </div>
            </section>
          </TabsContent>

          {/* ── CONVERSATION TAB ── */}
          <TabsContent value="conversation">
            <section className="mt-4 border border-border bg-card p-5">
              <p className="micro-label">WhatsApp conversation</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Use the dedicated thread to check the 24-hour window and send an approved message.
              </p>
              {conversation ? (
                <Button asChild className="mt-4">
                  <Link to="/inbox/$sessionId" params={{ sessionId: conversation.id }}>
                    <MessageCircle />Open conversation
                  </Link>
                </Button>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">No conversation has been recorded for this mover.</p>
              )}
            </section>
          </TabsContent>

          {/* ── ACTIVITY TAB ── */}
          <TabsContent value="activity">
            <section className="mt-4 border border-border bg-card p-5">
              <p className="micro-label">Activity</p>
              <div className="mt-4 space-y-4 border-l border-border pl-4 text-sm">
                <p>Driver licence status: <span className="font-semibold capitalize">{licenceStatus}</span></p>
                <p>Insurance valid through: <span className="font-semibold">{formatLondon(mover.insuranceExpiresAt)}</span></p>
                <p>Last WhatsApp activity: <span className="font-semibold">{formatLondon(mover.lastActiveAt)}</span></p>
              </div>
            </section>
          </TabsContent>
        </Tabs>

        {/* ── FULL IMAGE PREVIEW LIGHTBOX DIALOG ── */}
        <Dialog open={Boolean(previewDoc)} onOpenChange={(open) => !open && setPreviewDoc(null)}>
          <DialogContent className="max-w-3xl overflow-hidden p-0">
            <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
              <DialogTitle className="text-base font-semibold">{previewDoc?.title || "Document Preview"}</DialogTitle>
              {previewDoc?.url && (
                <Button asChild variant="outline" size="sm" className="mr-6">
                  <a href={previewDoc.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} className="mr-1.5" /> Open original
                  </a>
                </Button>
              )}
            </DialogHeader>
            <div className="max-h-[75vh] overflow-auto bg-black/90 p-4 flex items-center justify-center">
              {previewDoc?.url && (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  className="max-h-[70vh] max-w-full rounded object-contain shadow-2xl"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Workspace>
  );
}

function formatDocDate(val?: string | null): string {
  if (!val) return "Not uploaded";
  const dt = DateTime.fromISO(val, { zone: "utc" });
  if (dt.isValid) return dt.setZone("Europe/London").toFormat("ccc d LLL, HH:mm ZZZZ");
  return val;
}

function DocumentCard({
  title,
  status,
  uploadedAt,
  imageUrl,
  onViewFull,
  onApprove,
  onRequest,
}: {
  title: string;
  status: string;
  uploadedAt: string;
  imageUrl?: string | null | undefined;
  onViewFull?: (() => void) | undefined;
  onApprove: () => void;
  onRequest: () => void;
}) {
  return (
    <article className="border border-border bg-card p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-muted-foreground" />
            <h3 className="text-base font-semibold">{title}</h3>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="mt-4 grid gap-2 text-sm">
          <KeyValue
            label="Last Updated"
            value={imageUrl ? formatDocDate(uploadedAt) : (status === "deferred" ? "Deferred during onboarding" : "Not uploaded")}
          />
        </div>

        {/* Document Visual Preview */}
        <div className="mt-4">
          {imageUrl ? (
            <div className="relative group rounded-md border border-border bg-muted overflow-hidden">
              <img
                src={imageUrl}
                alt={title}
                className="h-48 w-full object-cover group-hover:scale-102 transition-transform cursor-pointer"
                onClick={onViewFull}
              />
              <div
                onClick={onViewFull}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-semibold cursor-pointer transition-opacity"
              >
                <Eye size={16} /> Click to enlarge
              </div>
            </div>
          ) : (
            <div className="flex h-36 flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/40 p-4 text-center">
              <ImageIcon className="size-8 text-muted-foreground/60 mb-2" />
              <p className="text-xs text-muted-foreground font-medium">No document uploaded yet</p>
              <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                {status === "deferred"
                  ? "Mover deferred this document during WhatsApp onboarding"
                  : "Mover has not submitted this file via onboarding"}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
        {imageUrl && onViewFull && (
          <Button size="sm" variant="secondary" onClick={onViewFull}>
            <Eye size={14} className="mr-1" /> View Full
          </Button>
        )}
        <Button size="sm" onClick={onApprove}>
          <CheckCircle2 size={14} className="mr-1" /> Approve
        </Button>
        <Button size="sm" variant="outline" onClick={onRequest}>
          Request clearer copy
        </Button>
      </div>
    </article>
  );
}