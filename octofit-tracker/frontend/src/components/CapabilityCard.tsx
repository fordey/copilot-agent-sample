import type { ReactNode } from 'react';
import type { ApiResourceState } from '../api/useApiResource.js';

type Props<T> = {
  title: string;
  description: string;
  emptyMessage: string;
  state: ApiResourceState<T>;
  isEmpty: (data: T) => boolean;
  children: (data: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, emptyMessage, state, isEmpty, children }: Props<T>) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {state.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}: {state.message}</p>}
        {state.status === 'success' && (isEmpty(state.data) ? <p>{emptyMessage}</p> : children(state.data))}
      </div>
    </section>
  );
}
