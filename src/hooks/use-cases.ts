import { useStaticQuery, graphql } from "gatsby"
import { Case, CaseSchema } from "../types/case";
export const useCases = () => {
    const data = useStaticQuery(
        graphql`
        query MyQuery {
            allCase(sort: {fields: confirm_timestamp, order: DESC}) {
              edges {
                node {
                  history
                  id
                  patient_id
                  sex
                  age
                  exposures {
                    address
                    district
                    patient_id
                    remarks
                    timestamp
                  }
                  confirm_timestamp
                  updated_at
                }
              }
            }
          }          
    `
    );// parse the data
    let cases: Case[] = data["allCase"]["edges"].map(({ node }: { node: CaseSchema }) => Case.fromMap(node));
    return cases;
}