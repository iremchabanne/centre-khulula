// The photograph at the top of a species or animal card. The sand block behind
// it shows while the image loads, or instead of a broken-image icon if it is
// missing. The alt is empty because the name is written right underneath.
export default function SpeciesPhoto({ url }: { url: string }) {
  return (
    <div className="h-40 bg-khulula-surface-alt">
      {/* object-top: the crop keeps the top of the photograph, where the
          animal's head usually is. */}
      <img
        src={url}
        alt=""
        className="h-40 w-full object-cover object-top"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}
