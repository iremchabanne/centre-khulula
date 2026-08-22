// Recording a donation.
//
// A donation records an INTENTION only: an amount, a donor, a date, a message.
// There is no payment provider and there are no card fields, anywhere, ever.
// That is an explicit out-of-scope decision in the cahier des charges.

import type { PrismaClient } from '@prisma/client';
import type { CreateDonationInput } from '../schemas';

export class DonationService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async record(input: CreateDonationInput) {
    return this.prisma.donation.create({
      data: {
        amount: input.amount,
        // The form sends nothing for an anonymous donation; the column stores
        // NULL rather than an empty string, so "not given" has one spelling.
        donor_name: input.donor_name ?? null,
        donor_email: input.donor_email ?? null,
        message: input.message ?? null,
        consent_given: input.consent_given,
      },
      // Only these three come back. The donor's name and email were sent by
      // the visitor and there is no reason to echo them: a response is a place
      // personal data can leak into a log or a browser cache.
      select: { id: true, amount: true, created_at: true },
    });
  }
}
