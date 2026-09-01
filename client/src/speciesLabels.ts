// The IUCN scale, written out. The database stores the machine spelling; a
// visitor reads the words. Shared by the list and the detail page.
export type IucnStatus =
  | 'least_concern'
  | 'near_threatened'
  | 'vulnerable'
  | 'endangered'
  | 'critically_endangered';

export function iucnLabel(status: IucnStatus) {
  if (status === 'least_concern') {
    return 'Least concern';
  }
  if (status === 'near_threatened') {
    return 'Near threatened';
  }
  if (status === 'vulnerable') {
    return 'Vulnerable';
  }
  if (status === 'endangered') {
    return 'Endangered';
  }
  return 'Critically endangered';
}
