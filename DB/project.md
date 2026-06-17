### Project List
- so far there are about25 projects:

| project_leaders | project_investigators | project_id                  | project_details |
|-----------------|-----------------------|-----------------------------|-----------------|
| AM; AP; PP      | -                     | HistogenLayersGenome2       | Genome assembly of grace and murcott varieties with nanopore reads |
| AM; AP; PP      | -                     | HistogenLayersUnsure1       | - |
| AM; AP; PP      | ZS                    | HistogenLayers5             | DGE of grace/murcott citrus varieties when exposed to pathogen |
| AM; PP          | MK                    | MaikoMurcottWildType        | - |

item for HistogenLayersGenome2 project, eg. <details>
```
  {
    "pKey": "PROJECT#PR00020",
    "sKey": "#METADATA",
    "EntityType": "Project",
    "projectName": "HistogenLayersGenome2",
    "projectCode": "PR00020",
    "displayName": "PR00020 (HistogenLayers Genome 2)"
    "description": "Genome assembly of grace and murcott varieties with nanopore reads "
    "leaders": ["AM", "AP", "PP"],
    "team":["USER#Maiko_Kato", "USER#Zachary_Stewart"]
    "analysisId":"analysis pipeline",
    "createdAt": "2026-06-15T...",
    "createdBy": "USER#Zachary_Stewart",
    "importedBy": "USER#Christina_xu"
  }

```

 </details>
 
## diagram
```mermaid
erDiagram
    PROJECT ||--o{ SEQUENCE : "contains"
    PROJECT ||--o{ SEQUENCE3 : "contains"

    PROJECT {
        string pKey "PROJECT#PR00020"
        string sKey "#METADATA"
        string EntityType "Project"
        string projectName "HistogenLayersGenome2"
        string projectCode "PR00020"
        string displayName "PR00020 (HistogenLayers Genome 2)"
        string description "Genome assembly of grace and murcott varieties with nanopore reads"
        string leaders "AM, AP, PP"
        string team "Maiko_Kato, Zachary_Stewart"
        string analysisId "analysis pipeline"
        string createdAt "2026-06-15T..."
        string createdBy "USER#Zachary_Stewart"
        string importedBy "USER#Christina_xu"
    }

    SEQUENCE {
        string pKey "SEQUENCE#SE00002"
        string sKey "#METADATA"
        string entityType "SequenceData"
        string SequenceId "SE00002"
        string runId "???"
        string libraryType_sequencer "rnaseq"
        string molecule "RNA"
        string hpcLocation "/local/ePGL/sequencing/rna/data/ok/Pete_NGS_498"
        string rdssLocation "\\rstore.edu.au\Projects\...\2025-03-01 NGS_AAA_444 WGS"
        string md5_runid "..."
        string notes "Juice vesicle cell line #1"
        string createdAt "2026-06-16T..."
        string createdBy "USER#Zachary_Stewart"
        string importedBy "USER#christina_xu"
    }

    SEQUENCE3 {
        string pKey "SEQUENCE#SE00003"
        string sKey "#METADATA"
        string entityType "SequenceData"
        string SequenceId "SE00003"
        string otherAttributes "..."
    }
```
