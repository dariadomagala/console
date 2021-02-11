import React from 'react';

import './Preferences.scss';
import NamespaceSettings from './NamespaceSettings';
import ExperimentalFunctionalities from './ExperimentalFunctionalities';
import KubernetesApiUrl from './KubernetesApiUrl';

import { PageHeader } from 'react-shared';

export default function Preferences() {
  return (
    <main class="preferences">
      <PageHeader title="Preferences" />
      <NamespaceSettings />
      <ExperimentalFunctionalities />
      <KubernetesApiUrl />
    </main>
  );
}