import type { MDXComponents } from 'mdx/types'
import { Quiz } from '@/components/content/Quiz'
import { Flashcard } from '@/components/content/Flashcard'
import { WarStory } from '@/components/content/WarStory'
import { ProTip } from '@/components/content/ProTip'
import { SC300Badge } from '@/components/content/SC300Badge'
import { Definition } from '@/components/content/Definition'
import { PowerShellBlock } from '@/components/content/PowerShellBlock'
import { CommandReference } from '@/components/content/CommandReference'
import { HoloPanel } from '@/components/jarvis/HoloPanel'
import { KerberosFlowDiagram } from '@/components/diagrams/KerberosFlowDiagram'
import { SAMLFlowDiagram } from '@/components/diagrams/SAMLFlowDiagram'
import { OAuthFlowDiagram } from '@/components/diagrams/OAuthFlowDiagram'
import { HybridIdentityDiagram } from '@/components/diagrams/HybridIdentityDiagram'
import { EcosystemMap } from '@/components/diagrams/EcosystemMap'
import { CyberArkArchDiagram } from '@/components/diagrams/CyberArkArchDiagram'
import { SailPointAggregationDiagram } from '@/components/diagrams/SailPointAggregationDiagram'
import { AWSIAMEvalDiagram } from '@/components/diagrams/AWSIAMEvalDiagram'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Quiz,
    Flashcard,
    WarStory,
    ProTip,
    SC300Badge,
    Definition,
    PowerShellBlock,
    CommandReference,
    HoloPanel,
    KerberosFlowDiagram,
    SAMLFlowDiagram,
    OAuthFlowDiagram,
    HybridIdentityDiagram,
    EcosystemMap,
    CyberArkArchDiagram,
    SailPointAggregationDiagram,
    AWSIAMEvalDiagram
  }
}
