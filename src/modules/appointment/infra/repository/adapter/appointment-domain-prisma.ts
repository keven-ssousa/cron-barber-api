interface DomainToPrismaAdapter<TDomain, TPrisma> {
  toPrisma(domainObject: TDomain): TPrisma;
}
