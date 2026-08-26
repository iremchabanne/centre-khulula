// Recording a donation.
//
// A donation records an INTENTION only: an amount, a donor, a date, a message.
// There is no payment provider and there are no card fields, anywhere, ever.
// That is an explicit out-of-scope decision in the cahier des charges.

import type { PrismaClient } from '@prisma/client';
import { pageQuery, pageResult } from '../pagination';
import type { CreateDonationInput, ListDonationsQuery } from '../schemas';

export class DonationService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // The donation list — screen 11, administrators only.
  //
  // The donor's name and email are returned here, and that is not a
  // contradiction with `record` below: an administrator reading the list is
  // exactly who those fields were collected for. What protects the donor is
  // upstream — a donation whose donor did not consent has nothing stored in
  // those columns at all, so there is nothing here to show.
  async findAll(query: ListDonationsQuery) {
    const donations = await this.prisma.donation.findMany({
      orderBy: { created_at: 'desc' },
      ...pageQuery(query.page),
    });

    const total = await this.prisma.donation.count();

    return pageResult(donations, total, query.page);
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
